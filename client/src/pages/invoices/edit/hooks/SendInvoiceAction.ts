import axios from 'axios';
import { Invoice } from '$app/common/interfaces/invoice';

export async function handleSendInvoice(invoices: Invoice[]) {
  const token = localStorage.getItem('X-API-TOKEN') ?? '';

  const results: { invoiceId: string; status: string; error?: string }[] = [];

  const invoiceIds = invoices.map((inv) => inv.id);

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/wa/message/send-invoice`,
      { invoice_ids: invoiceIds },
      {
        headers: {
          'X-API-TOKEN': token,
          'Accept': 'application/json',
        },
      }
    );

    const responseResults = res.data.results;

    responseResults.forEach((r: any) => {
      results.push({
        invoiceId: r.invoice_id,
        status: r.status,
        error: r.reason,
      });
    });

    const successCount = results.filter((r) => r.status === 'success').length;
    const failCount = results.length - successCount;

    alert(`📤 ${successCount} invoice berhasil dikirim.\n❌ ${failCount} gagal.`);
    console.table(results);
  } catch (err: any) {
    console.error('Gagal mengirim invoices:', err);
    alert(err.response?.data?.message || 'Gagal mengirim beberapa invoice.');
  }
}