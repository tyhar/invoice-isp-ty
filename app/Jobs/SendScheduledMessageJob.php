<?php

namespace App\Jobs;

use App\Models\ScheduledMessage;
use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Invoice;
use App\Models\Client;
use Carbon\Carbon;
use App\Jobs\Entity\CreateRawPdf;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class SendScheduledMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $schedule;

    public function __construct(ScheduledMessage $schedule)
    {
        $this->schedule = $schedule;
    }

    protected function replacePlaceholders(string $template, Client $client, array $extraData = []): string
    {
        $replacements = array_merge([
            '{{name}}' => $client->name,
        ], [
            '{{amount}}' => $extraData['amount'] ?? '',
            '{{due_date}}' => $extraData['due_date'] ?? '',
            '{{bulan}}' => $extraData['bulan'] ?? '',
        ]);

        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }

    public function handle()
    {
        $now = Carbon::now();
        $schedule = $this->schedule;

        $schedule->loadMissing('clients', 'device', 'messageTemplate');

        foreach ($schedule->clients as $client) {
            $text = $schedule->text ?? $schedule->messageTemplate?->content ?? '';

            $extraData = [];
            $pdfUrl = null;
            $fileName = null;

            // Jika include_invoice bernilai true, proses invoice
            if ($schedule->include_invoice) {
                $invoice = Invoice::where('client_id', $client->id)->latest()->first();

                if ($invoice) {
                    // Ambil data invoice untuk placeholder
                    $amount = number_format($invoice->amount, 0, ',', '.');

                    if ($invoice->due_date) {
                        Carbon::setLocale('id');
                        $due = Carbon::parse($invoice->due_date);
                        $dueDate = $due->translatedFormat('d F Y');
                        $bulan = $due->translatedFormat('F Y');
                    } else {
                        $dueDate = 'N/A';
                        $bulan = 'N/A';
                    }

                    $extraData = [
                        'amount' => $amount,
                        'due_date' => $dueDate,
                        'bulan' => $bulan,
                    ];

                    // Generate PDF invoice
                    try {
                        $invitation = $invoice->invitations->first();
                        if ($invitation) {
                            App::setLocale($invitation->contact->preferredLocale());

                            $pdfContent = (new CreateRawPdf($invitation))->handle();
                            $fileName = "invoice_{$invoice->number}.pdf";
                            $storagePath = "public/invoices/{$fileName}";
                            Storage::put($storagePath, $pdfContent);
                            $pdfUrl = url(Storage::url($storagePath));
                        }
                    } catch (\Exception $e) {
                        Log::error('Failed to generate PDF for invoice', [
                            'schedule_id' => $schedule->id,
                            'client_id' => $client->id,
                            'invoice_id' => $invoice->id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                } else {
                    // Jika tidak ada invoice, set default values
                    $extraData = [
                        'amount' => '0',
                        'due_date' => 'N/A',
                        'bulan' => 'N/A',
                    ];
                }
            }

            $finalText = $this->replacePlaceholders($text, $client, $extraData);

            try {
                // Prepare message data
                $messageData = [
                    'session' => $schedule->device->name,
                    'to' => $client->phone,
                    'text' => $finalText,
                    'is_group' => false,
                ];

                // Tambahkan document jika ada PDF
                if ($pdfUrl && $fileName) {
                    $messageData['document_url'] = $pdfUrl;
                    $messageData['document_name'] = 'invoice.pdf';
                }

                $response = app('wa')->sendMessage($messageData);

                // Prepare message record data
                $messageRecord = [
                    'device_id' => $schedule->device_id,
                    'client_id' => $client->id,
                    'message_template_id' => $schedule->message_template_id,
                    'message' => $finalText,
                    'status' => $response['status'] ?? 'failed',
                ];

                // Tambahkan file info jika ada PDF
                if ($pdfUrl && $fileName) {
                    $messageRecord['file'] = 'invoice.pdf';
                    $messageRecord['url'] = $pdfUrl;
                }

                Message::create($messageRecord);

            } catch (\Exception $e) {
                Log::error('Failed to send scheduled message', [
                    'schedule_id' => $schedule->id,
                    'client_id' => $client->id,
                    'error' => $e->getMessage(),
                ]);

                // Tetap buat record message dengan status failed
                Message::create([
                    'device_id' => $schedule->device_id,
                    'client_id' => $client->id,
                    'message_template_id' => $schedule->message_template_id,
                    'message' => $finalText,
                    'status' => 'failed',
                    'file' => $fileName ? 'invoice.pdf' : null,
                    'url' => $pdfUrl,
                ]);
            }
        }

        // Update next run date
        $nextDate = match ($schedule->frequency) {
            'every_minute' => $now->copy()->addMinute(),
            'daily' => $now->copy()->addDay(),
            'weekly' => $now->copy()->addWeek(),
            'monthly' => $this->getNextMonthlyDate($schedule->next_run_date ?? $now),
            'yearly' => $now->copy()->addYear(),
            default => $now->copy()->addDay(),
        };

        $schedule->update(['next_run_date' => $nextDate]);
    }

    protected function getNextMonthlyDate(Carbon $fromDate): Carbon
    {
        $desiredDay = $fromDate->day;
        $nextMonth = $fromDate->copy()->addMonthsNoOverflow(1);

        $daysInTargetMonth = $nextMonth->daysInMonth;

        if ($desiredDay > $daysInTargetMonth) {
            return $nextMonth->copy()->endOfMonth();
        }

        return $nextMonth->copy()->setDay($desiredDay);
    }

}
