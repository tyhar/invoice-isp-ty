# BUKU MANUAL SISTEM INVOICE ISP
## Panduan Lengkap Penggunaan Sistem Invoice Ninja dengan Fitur FTTH dan WA Gateway

---

## DAFTAR ISI

1. [Pendahuluan](#pendahuluan)
2. [Fitur Dasar Invoice Ninja](#fitur-dasar-invoice-ninja)
3. [Fitur FTTH (Fiber to the Home)](#fitur-fth-fiber-to-the-home)
4. [Fitur Mapping dan Visualisasi Fiber Optik](#fitur-mapping-dan-visualisasi-fiber-optik)
5. [Fitur WA Gateway](#fitur-wa-gateway)
6. [Dashboard dan Laporan](#dashboard-dan-laporan)
7. [Pengaturan Sistem](#pengaturan-sistem)

---

## PENDAHULUAN

Sistem Invoice ISP adalah platform manajemen bisnis yang mengintegrasikan fitur Invoice Ninja dengan modul khusus untuk industri Internet Service Provider (ISP). Sistem ini dirancang untuk mengelola operasional bisnis ISP termasuk penagihan, manajemen infrastruktur fiber optik, dan komunikasi pelanggan melalui WhatsApp.

### Fitur Utama Sistem:
- **Invoice Ninja**: Manajemen invoice, pembayaran, dan pelanggan
- **FTTH Management**: Pengelolaan infrastruktur fiber optik
- **Mapping & Visualization**: Visualisasi jaringan fiber optik
- **WA Gateway**: Integrasi WhatsApp untuk komunikasi pelanggan
- **Reports & Analytics**: Laporan dan analisis komprehensif

---

## FITUR DASAR INVOICE NINJA

### 1. Masuk Aplikasi

**Langkah-langkah:**
1. Buka browser web dan kunjungi URL sistem yang telah disediakan
2. Masukkan kredensial email dan password yang valid
3. Klik tombol "Login"
4. Sistem akan mengarahkan ke Dashboard utama

### 2. Dashboard

**Fitur Dashboard:**
- **Recent Payments**: Pembayaran terbaru
- **Recent Activity**: Aktivitas terbaru sistem
- **Upcoming Invoices**: Invoice yang akan jatuh tempo
- **Past Due Invoices**: Invoice yang sudah lewat jatuh tempo
- **FTTH Statistics**: Statistik infrastruktur fiber optik
- **Grafik Overview**: Visualisasi cash flow dan metrik bisnis

**Cara Menggunakan Dashboard:**
1. Dashboard menampilkan ringkasan data bisnis secara real-time
2. Klik pada kartu statistik untuk melihat detail lebih lanjut
3. Gunakan filter tanggal untuk melihat data periode tertentu
4. Akses menu navigasi untuk masuk ke modul tertentu

### 3. Manajemen Klien

**Fitur:**
- Tambah, edit, dan hapus data klien
- Import data klien dari file Excel/CSV
- Kategorisasi klien berdasarkan grup
- Riwayat transaksi klien
- Integrasi dengan WA Gateway untuk komunikasi

**Langkah-langkah Menambah Klien:**
1. Klik menu "Clients" di sidebar
2. Klik tombol "New Client" (+)
3. Isi form data klien:
   - Nama klien
   - Email dan nomor telepon
   - Alamat lengkap
   - Informasi kontak
4. Klik "Save" untuk menyimpan

### 4. Manajemen Invoice

**Fitur:**
- Buat invoice baru
- Template invoice yang dapat dikustomisasi
- Sistem pengiriman otomatis
- Tracking status pembayaran
- Integrasi dengan WA Gateway

**Langkah-langkah Membuat Invoice:**
1. Klik menu "Invoices" di sidebar
2. Klik tombol "New Invoice" (+)
3. Pilih klien dari dropdown
4. Tambahkan item produk/layanan
5. Set tanggal jatuh tempo
6. Klik "Save" dan "Send"

### 5. Manajemen Pembayaran

**Fitur:**
- Pencatatan pembayaran manual
- Integrasi gateway pembayaran
- Rekonsiliasi otomatis
- Laporan cash flow

**Langkah-langkah Mencatat Pembayaran:**
1. Klik menu "Payments" di sidebar
2. Klik tombol "New Payment" (+)
3. Pilih invoice yang dibayar
4. Masukkan jumlah pembayaran
5. Pilih metode pembayaran
6. Klik "Save"

### 6. Manajemen Produk

**Fitur:**
- Katalog produk dan layanan
- Harga dan deskripsi produk
- Kategorisasi produk
- Template produk untuk layanan berulang

**Langkah-langkah Menambah Produk:**
1. Klik menu "Products" di sidebar
2. Klik tombol "New Product" (+)
3. Isi informasi produk:
   - Nama produk
   - Deskripsi
   - Harga
   - Kategori
4. Klik "Save"

### 7. Laporan dan Analisis

**Fitur:**
- Laporan penjualan
- Laporan pembayaran
- Analisis profitabilitas
- Laporan klien
- Export data ke PDF/Excel

---

## FITUR FTTH (FIBER TO THE HOME)

### 1. Manajemen Lokasi

**Fitur:**
- Pendataan lokasi geografis dengan geocoding otomatis
- Koordinat GPS (latitude/longitude) dengan validasi
- Informasi detail lokasi (provinsi, kota, negara)
- Status aktif/nonaktif dengan soft delete
- Bulk operations (archive, delete, restore)
- Export data ke CSV/Excel
- Filter dan pencarian advanced

**Langkah-langkah Menambah Lokasi:**
1. Klik menu "FIBER OPTIK" → "Lokasi"
2. Klik tombol "New Lokasi" (+)
3. Isi form:
   - **Nama lokasi** (wajib)
   - **Deskripsi** (opsional)
   - **Alamat lengkap** untuk geocoding otomatis
   - **Latitude dan longitude** (akan terisi otomatis jika alamat diisi)
   - **Provinsi, Kota, Negara** (terisi otomatis dari geocoding)
   - **Status** (active/archived)
4. Klik "Save" untuk menyimpan

**Fitur Geocoding:**
- Sistem akan otomatis mengisi koordinat GPS berdasarkan alamat
- Validasi koordinat untuk memastikan akurasi
- Fallback manual jika geocoding gagal
- Preview lokasi di peta mini

**Bulk Operations:**
1. **Bulk Archive:**
   - Pilih beberapa lokasi dengan checkbox
   - Klik "Bulk Actions" → "Archive"
   - Konfirmasi aksi
   - Lokasi akan diarsipkan (tidak dihapus permanen)

2. **Bulk Delete:**
   - Pilih beberapa lokasi dengan checkbox
   - Klik "Bulk Actions" → "Delete"
   - Konfirmasi aksi
   - Lokasi akan dihapus (soft delete)

3. **Bulk Restore:**
   - Akses halaman "Archived Locations"
   - Pilih lokasi yang akan dipulihkan
   - Klik "Bulk Actions" → "Restore"
   - Lokasi akan kembali aktif

**Edit Lokasi:**
1. Klik pada baris lokasi yang akan diedit
2. Klik tombol "Edit" (ikon pensil)
3. Ubah data yang diperlukan
4. Klik "Save" untuk menyimpan perubahan

**Delete Lokasi:**
1. Klik pada baris lokasi yang akan dihapus
2. Klik tombol "Delete" (ikon sampah)
3. Konfirmasi penghapusan
4. Lokasi akan dihapus (soft delete)

**Restore Lokasi:**
1. Klik menu "Archived" di halaman lokasi
2. Pilih lokasi yang akan dipulihkan
3. Klik tombol "Restore"
4. Lokasi akan kembali aktif

**Filter dan Pencarian:**
- Filter berdasarkan status (active/archived)
- Filter berdasarkan provinsi/kota
- Pencarian berdasarkan nama lokasi
- Sort berdasarkan nama, tanggal dibuat, status

### 2. Manajemen ODC (Optical Distribution Cabinet)

**Fitur:**
- Pendataan cabinet distribusi optik dengan detail teknis
- Hubungan dengan lokasi (one-to-many)
- Status operasional (active/archived/deleted)
- Kapasitas dan utilisasi real-time
- Bulk operations (archive, delete, restore)
- Export data ke CSV/Excel
- Filter dan pencarian advanced
- Validasi hubungan dengan lokasi

**Langkah-langkah Menambah ODC:**
1. Klik menu "FIBER OPTIK" → "ODC"
2. Klik tombol "New ODC" (+)
3. Isi form:
   - **Nama ODC** (wajib, unik)
   - **Pilih lokasi** (dropdown dengan search)
   - **Deskripsi** (opsional)
   - **Kapasitas maksimal** (jumlah port)
   - **Status** (active/archived)
   - **Tanggal instalasi** (opsional)
   - **Vendor/manufacturer** (opsional)
4. Klik "Save" untuk menyimpan

**Bulk Operations:**
1. **Bulk Archive:**
   - Pilih beberapa ODC dengan checkbox
   - Klik "Bulk Actions" → "Archive"
   - Konfirmasi aksi
   - ODC akan diarsipkan

2. **Bulk Delete:**
   - Pilih beberapa ODC dengan checkbox
   - Klik "Bulk Actions" → "Delete"
   - Konfirmasi aksi
   - ODC akan dihapus (soft delete)

3. **Bulk Restore:**
   - Akses halaman "Archived ODCs"
   - Pilih ODC yang akan dipulihkan
   - Klik "Bulk Actions" → "Restore"

**Edit ODC:**
1. Klik pada baris ODC yang akan diedit
2. Klik tombol "Edit" (ikon pensil)
3. Ubah data yang diperlukan
4. Klik "Save" untuk menyimpan perubahan

**Delete ODC:**
1. Klik pada baris ODC yang akan dihapus
2. Klik tombol "Delete" (ikon sampah)
3. Konfirmasi penghapusan
4. Sistem akan memvalidasi apakah ODC masih terhubung dengan ODP

**Restore ODC:**
1. Klik menu "Archived" di halaman ODC
2. Pilih ODC yang akan dipulihkan
3. Klik tombol "Restore"

**Filter dan Pencarian:**
- Filter berdasarkan status (active/archived)
- Filter berdasarkan lokasi
- Filter berdasarkan vendor
- Pencarian berdasarkan nama ODC
- Sort berdasarkan nama, lokasi, status, tanggal instalasi

**Validasi:**
- Nama ODC harus unik
- Lokasi harus dipilih
- Validasi kapasitas (tidak boleh negatif)
- Cek dependensi sebelum delete

### 3. Manajemen Kabel ODC

**Fitur:**
- Pendataan kabel fiber optik dengan spesifikasi lengkap
- Spesifikasi teknis kabel (tipe, diameter, loss)
- Panjang kabel dengan validasi
- Tipe dan kapasitas dengan kalkulasi otomatis
- Bulk operations (archive, delete, restore)
- Export data ke CSV/Excel
- Filter dan pencarian advanced
- Validasi hubungan dengan ODC

**Langkah-langkah Menambah Kabel ODC:**
1. Klik menu "FIBER OPTIK" → "KABEL" → "Kabel ODC"
2. Klik tombol "New Kabel ODC" (+)
3. Isi form:
   - **Nama kabel** (wajib, unik)
   - **Tipe kabel** (dropdown: Single Mode, Multi Mode)
   - **Panjang kabel** (meter, wajib)
   - **Jumlah tube** (wajib, akan otomatis menghitung total core)
   - **Jumlah core per tube** (wajib, default 12)
   - **Total core** (otomatis: tube × core per tube)
   - **Diameter kabel** (mm, opsional)
   - **Loss per km** (dB/km, opsional)
   - **Vendor/manufacturer** (opsional)
   - **Tanggal instalasi** (opsional)
   - **Status** (active/archived)
4. Klik "Save" untuk menyimpan

**Kalkulasi Otomatis:**
- Total core = Jumlah tube × Jumlah core per tube
- Loss total = Panjang kabel × Loss per km
- Kapasitas utilisasi = (Core terpakai / Total core) × 100%

**Bulk Operations:**
1. **Bulk Archive:**
   - Pilih beberapa kabel dengan checkbox
   - Klik "Bulk Actions" → "Archive"
   - Konfirmasi aksi

2. **Bulk Delete:**
   - Pilih beberapa kabel dengan checkbox
   - Klik "Bulk Actions" → "Delete"
   - Konfirmasi aksi
   - Validasi dependensi dengan tube dan core

3. **Bulk Restore:**
   - Akses halaman "Archived Kabel"
   - Pilih kabel yang akan dipulihkan
   - Klik "Bulk Actions" → "Restore"

**Edit Kabel ODC:**
1. Klik pada baris kabel yang akan diedit
2. Klik tombol "Edit" (ikon pensil)
3. Ubah data yang diperlukan
4. Sistem akan otomatis menghitung ulang total core
5. Klik "Save" untuk menyimpan perubahan

**Delete Kabel ODC:**
1. Klik pada baris kabel yang akan dihapus
2. Klik tombol "Delete" (ikon sampah)
3. Konfirmasi penghapusan
4. Sistem akan memvalidasi apakah kabel masih terhubung dengan tube/core

**Restore Kabel ODC:**
1. Klik menu "Archived" di halaman kabel
2. Pilih kabel yang akan dipulihkan
3. Klik tombol "Restore"

**Filter dan Pencarian:**
- Filter berdasarkan status (active/archived)
- Filter berdasarkan tipe kabel
- Filter berdasarkan vendor
- Filter berdasarkan panjang kabel
- Pencarian berdasarkan nama kabel
- Sort berdasarkan nama, tipe, panjang, status

**Validasi:**
- Nama kabel harus unik
- Panjang kabel harus positif
- Jumlah tube dan core harus positif
- Validasi dependensi sebelum delete

### 4. Manajemen Tube Kabel

**Fitur:**
- Pendataan tube dalam kabel dengan warna identifikasi
- Warna tube untuk identifikasi visual
- Hubungan dengan kabel ODC (one-to-many)
- Status utilisasi real-time
- Bulk operations (archive, delete, restore)
- Export data ke CSV/Excel
- Filter dan pencarian advanced
- Validasi kapasitas tube

**Langkah-langkah Menambah Tube:**
1. Klik menu "FIBER OPTIK" → "KABEL" → "Tube Kabel ODC"
2. Klik tombol "New Tube" (+)
3. Isi form:
   - **Pilih kabel ODC** (dropdown dengan search)
   - **Warna tube** (dropdown: Merah, Biru, Hijau, Kuning, Putih, dll)
   - **Nomor tube** (opsional, untuk identifikasi)
   - **Deskripsi** (opsional)
   - **Status** (active/archived)
   - **Tanggal instalasi** (opsional)
4. Klik "Save" untuk menyimpan

**Validasi Kapasitas:**
- Sistem akan mengecek apakah jumlah tube tidak melebihi kapasitas kabel
- Validasi warna tube (tidak boleh duplikat dalam satu kabel)
- Cek dependensi dengan core sebelum delete

**Bulk Operations:**
1. **Bulk Archive:**
   - Pilih beberapa tube dengan checkbox
   - Klik "Bulk Actions" → "Archive"
   - Konfirmasi aksi

2. **Bulk Delete:**
   - Pilih beberapa tube dengan checkbox
   - Klik "Bulk Actions" → "Delete"
   - Konfirmasi aksi
   - Validasi dependensi dengan core

3. **Bulk Restore:**
   - Akses halaman "Archived Tubes"
   - Pilih tube yang akan dipulihkan
   - Klik "Bulk Actions" → "Restore"

**Edit Tube:**
1. Klik pada baris tube yang akan diedit
2. Klik tombol "Edit" (ikon pensil)
3. Ubah data yang diperlukan
4. Klik "Save" untuk menyimpan perubahan

**Delete Tube:**
1. Klik pada baris tube yang akan dihapus
2. Klik tombol "Delete" (ikon sampah)
3. Konfirmasi penghapusan
4. Sistem akan memvalidasi apakah tube masih terhubung dengan core

**Restore Tube:**
1. Klik menu "Archived" di halaman tube
2. Pilih tube yang akan dipulihkan
3. Klik tombol "Restore"

**Filter dan Pencarian:**
- Filter berdasarkan status (active/archived)
- Filter berdasarkan kabel ODC
- Filter berdasarkan warna tube
- Pencarian berdasarkan nomor tube
- Sort berdasarkan kabel, warna, status

**Validasi:**
- Kabel ODC harus dipilih
- Warna tube harus valid
- Validasi kapasitas kabel
- Cek dependensi sebelum delete

### 5. Manajemen Core Kabel

**Fitur:**
- Pendataan core dalam tube dengan warna identifikasi
- Warna core untuk identifikasi visual
- Status terhubung/tidak terhubung dengan ODP
- Hubungan dengan tube kabel (one-to-many)
- Bulk operations (archive, delete, restore)
- Export data ke CSV/Excel
- Filter dan pencarian advanced
- Validasi kapasitas core dan koneksi

**Langkah-langkah Menambah Core:**
1. Klik menu "FIBER OPTIK" → "KABEL" → "Core Kabel ODC"
2. Klik tombol "New Core" (+)
3. Isi form:
   - **Pilih tube kabel** (dropdown dengan search)
   - **Warna core** (dropdown: Merah, Biru, Hijau, Kuning, Putih, dll)
   - **Nomor core** (opsional, untuk identifikasi)
   - **Status** (available/connected/archived)
   - **ODP terhubung** (opsional, jika status connected)
   - **Tanggal instalasi** (opsional)
   - **Loss measurement** (dB, opsional)
4. Klik "Save" untuk menyimpan

**Status Core:**
- **Available**: Core tersedia untuk koneksi
- **Connected**: Core sudah terhubung ke ODP
- **Archived**: Core diarsipkan

**Validasi Kapasitas:**
- Sistem akan mengecek apakah jumlah core tidak melebihi kapasitas tube
- Validasi warna core (tidak boleh duplikat dalam satu tube)
- Cek dependensi dengan ODP sebelum delete

**Bulk Operations:**
1. **Bulk Archive:**
   - Pilih beberapa core dengan checkbox
   - Klik "Bulk Actions" → "Archive"
   - Konfirmasi aksi

2. **Bulk Delete:**
   - Pilih beberapa core dengan checkbox
   - Klik "Bulk Actions" → "Delete"
   - Konfirmasi aksi
   - Validasi dependensi dengan ODP

3. **Bulk Restore:**
   - Akses halaman "Archived Cores"
   - Pilih core yang akan dipulihkan
   - Klik "Bulk Actions" → "Restore"

**Edit Core:**
1. Klik pada baris core yang akan diedit
2. Klik tombol "Edit" (ikon pensil)
3. Ubah data yang diperlukan
4. Klik "Save" untuk menyimpan perubahan

**Delete Core:**
1. Klik pada baris core yang akan dihapus
2. Klik tombol "Delete" (ikon sampah)
3. Konfirmasi penghapusan
4. Sistem akan memvalidasi apakah core masih terhubung dengan ODP

**Restore Core:**
1. Klik menu "Archived" di halaman core
2. Pilih core yang akan dipulihkan
3. Klik tombol "Restore"

**Filter dan Pencarian:**
- Filter berdasarkan status (available/connected/archived)
- Filter berdasarkan tube kabel
- Filter berdasarkan warna core
- Filter berdasarkan ODP terhubung
- Pencarian berdasarkan nomor core
- Sort berdasarkan tube, warna, status, ODP

**Validasi:**
- Tube kabel harus dipilih
- Warna core harus valid
- Validasi kapasitas tube
- Cek dependensi sebelum delete
- Validasi koneksi ODP

### 6. Manajemen ODP (Optical Distribution Point)

**Fitur:**
- Pendataan titik distribusi optik dengan detail teknis
- Hubungan dengan ODC dan core (many-to-one)
- Kapasitas splitter dengan kalkulasi otomatis
- Status operasional (active/archived/deleted)
- Bulk operations (archive, delete, restore)
- Export data ke CSV/Excel
- Filter dan pencarian advanced
- Validasi hubungan dengan core dan client

**Langkah-langkah Menambah ODP:**
1. Klik menu "FIBER OPTIK" → "ODP"
2. Klik tombol "New ODP" (+)
3. Isi form:
   - **Nama ODP** (wajib, unik)
   - **Pilih lokasi** (dropdown dengan search)
   - **Pilih core kabel ODC** (dropdown dengan filter)
   - **Tipe splitter** (dropdown: 1:4, 1:8, 1:16, 1:32)
   - **Kapasitas maksimal** (otomatis berdasarkan tipe splitter)
   - **Jumlah port terpakai** (otomatis dari client terhubung)
   - **Status** (active/archived)
   - **Tanggal instalasi** (opsional)
   - **Koordinat GPS** (latitude/longitude, opsional)
   - **Deskripsi** (opsional)
4. Klik "Save" untuk menyimpan

**Kalkulasi Otomatis:**
- Kapasitas maksimal = Berdasarkan tipe splitter
- Port tersedia = Kapasitas maksimal - Port terpakai
- Utilisasi = (Port terpakai / Kapasitas maksimal) × 100%

**Bulk Operations:**
1. **Bulk Archive:**
   - Pilih beberapa ODP dengan checkbox
   - Klik "Bulk Actions" → "Archive"
   - Konfirmasi aksi

2. **Bulk Delete:**
   - Pilih beberapa ODP dengan checkbox
   - Klik "Bulk Actions" → "Delete"
   - Konfirmasi aksi
   - Validasi dependensi dengan client

3. **Bulk Restore:**
   - Akses halaman "Archived ODPs"
   - Pilih ODP yang akan dipulihkan
   - Klik "Bulk Actions" → "Restore"

**Edit ODP:**
1. Klik pada baris ODP yang akan diedit
2. Klik tombol "Edit" (ikon pensil)
3. Ubah data yang diperlukan
4. Sistem akan otomatis menghitung ulang kapasitas
5. Klik "Save" untuk menyimpan perubahan

**Delete ODP:**
1. Klik pada baris ODP yang akan dihapus
2. Klik tombol "Delete" (ikon sampah)
3. Konfirmasi penghapusan
4. Sistem akan memvalidasi apakah ODP masih terhubung dengan client

**Restore ODP:**
1. Klik menu "Archived" di halaman ODP
2. Pilih ODP yang akan dipulihkan
3. Klik tombol "Restore"

**Filter dan Pencarian:**
- Filter berdasarkan status (active/archived)
- Filter berdasarkan lokasi
- Filter berdasarkan tipe splitter
- Filter berdasarkan kapasitas (tersedia/penuh)
- Filter berdasarkan core kabel
- Pencarian berdasarkan nama ODP
- Sort berdasarkan nama, lokasi, kapasitas, status

**Validasi:**
- Nama ODP harus unik
- Lokasi harus dipilih
- Core kabel harus dipilih
- Validasi kapasitas splitter
- Cek dependensi sebelum delete
- Validasi koordinat GPS

### 7. Manajemen Client FTTH

**Fitur:**
- Pendataan pelanggan FTTH dengan detail lengkap
- Hubungan dengan ODP dan lokasi (many-to-one)
- Informasi layanan dan billing
- Status aktifasi (active/inactive/archived)
- Bulk operations (archive, delete, restore)
- Export data ke CSV/Excel
- Filter dan pencarian advanced
- Integrasi dengan sistem billing
- Validasi kapasitas ODP

**Langkah-langkah Menambah Client FTTH:**
1. Klik menu "FIBER OPTIK" → "Client FTTH"
2. Klik tombol "New Client FTTH" (+)
3. Isi form:
   - **Nama client** (wajib)
   - **Pilih lokasi** (dropdown dengan search)
   - **Pilih ODP** (dropdown dengan filter kapasitas)
   - **Alamat detail** (wajib)
   - **Nomor telepon** (opsional)
   - **Email** (opsional)
   - **Paket layanan** (dropdown: 10Mbps, 25Mbps, 50Mbps, 100Mbps)
   - **Status** (active/inactive/archived)
   - **Tanggal instalasi** (opsional)
   - **Tanggal aktifasi** (opsional)
   - **Koordinat GPS** (latitude/longitude, opsional)
   - **Catatan teknis** (opsional)
4. Klik "Save" untuk menyimpan

**Validasi Kapasitas ODP:**
- Sistem akan mengecek apakah ODP masih memiliki port tersedia
- Validasi paket layanan dengan kapasitas ODP
- Cek dependensi dengan invoice sebelum delete

**Bulk Operations:**
1. **Bulk Archive:**
   - Pilih beberapa client dengan checkbox
   - Klik "Bulk Actions" → "Archive"
   - Konfirmasi aksi

2. **Bulk Delete:**
   - Pilih beberapa client dengan checkbox
   - Klik "Bulk Actions" → "Delete"
   - Konfirmasi aksi
   - Validasi dependensi dengan invoice

3. **Bulk Restore:**
   - Akses halaman "Archived Clients"
   - Pilih client yang akan dipulihkan
   - Klik "Bulk Actions" → "Restore"

**Edit Client FTTH:**
1. Klik pada baris client yang akan diedit
2. Klik tombol "Edit" (ikon pensil)
3. Ubah data yang diperlukan
4. Klik "Save" untuk menyimpan perubahan

**Delete Client FTTH:**
1. Klik pada baris client yang akan dihapus
2. Klik tombol "Delete" (ikon sampah)
3. Konfirmasi penghapusan
4. Sistem akan memvalidasi apakah client masih memiliki invoice aktif

**Restore Client FTTH:**
1. Klik menu "Archived" di halaman client
2. Pilih client yang akan dipulihkan
3. Klik tombol "Restore"

**Filter dan Pencarian:**
- Filter berdasarkan status (active/inactive/archived)
- Filter berdasarkan lokasi
- Filter berdasarkan ODP
- Filter berdasarkan paket layanan
- Filter berdasarkan tanggal instalasi
- Pencarian berdasarkan nama client
- Sort berdasarkan nama, lokasi, status, paket

**Integrasi dengan Billing:**
- Otomatis membuat invoice untuk client baru
- Update status berdasarkan pembayaran
- Reminder otomatis untuk pembayaran
- Integrasi dengan WA Gateway untuk notifikasi

**Validasi:**
- Nama client wajib diisi
- Lokasi dan ODP harus dipilih
- Validasi kapasitas ODP
- Validasi paket layanan
- Cek dependensi sebelum delete
- Validasi koordinat GPS

### 8. Manajemen Joint Box

**Fitur:**
- Pendataan kotak sambungan dengan detail teknis
- Hubungan dengan kabel ODC (many-to-one)
- Lokasi geografis dengan koordinat GPS
- Status maintenance (active/maintenance/archived)
- Bulk operations (archive, delete, restore)
- Export data ke CSV/Excel
- Filter dan pencarian advanced
- Tracking maintenance schedule
- Validasi hubungan dengan kabel

**Langkah-langkah Menambah Joint Box:**
1. Klik menu "FIBER OPTIK" → "Joint Box"
2. Klik tombol "New Joint Box" (+)
3. Isi form:
   - **Nama joint box** (wajib, unik)
   - **Pilih lokasi** (dropdown dengan search)
   - **Pilih kabel ODC** (dropdown dengan filter)
   - **Tipe joint box** (dropdown: Fusion Splice, Mechanical Splice)
   - **Kapasitas sambungan** (jumlah core yang dapat disambung)
   - **Status** (active/maintenance/archived)
   - **Tanggal instalasi** (opsional)
   - **Tanggal maintenance terakhir** (opsional)
   - **Tanggal maintenance berikutnya** (opsional)
   - **Koordinat GPS** (latitude/longitude, opsional)
   - **Deskripsi** (opsional)
   - **Catatan teknis** (opsional)
4. Klik "Save" untuk menyimpan

**Status Joint Box:**
- **Active**: Joint box berfungsi normal
- **Maintenance**: Sedang dalam maintenance
- **Archived**: Joint box diarsipkan

**Bulk Operations:**
1. **Bulk Archive:**
   - Pilih beberapa joint box dengan checkbox
   - Klik "Bulk Actions" → "Archive"
   - Konfirmasi aksi

2. **Bulk Delete:**
   - Pilih beberapa joint box dengan checkbox
   - Klik "Bulk Actions" → "Delete"
   - Konfirmasi aksi
   - Validasi dependensi dengan kabel

3. **Bulk Restore:**
   - Akses halaman "Archived Joint Boxes"
   - Pilih joint box yang akan dipulihkan
   - Klik "Bulk Actions" → "Restore"

**Edit Joint Box:**
1. Klik pada baris joint box yang akan diedit
2. Klik tombol "Edit" (ikon pensil)
3. Ubah data yang diperlukan
4. Klik "Save" untuk menyimpan perubahan

**Delete Joint Box:**
1. Klik pada baris joint box yang akan dihapus
2. Klik tombol "Delete" (ikon sampah)
3. Konfirmasi penghapusan
4. Sistem akan memvalidasi apakah joint box masih terhubung dengan kabel

**Restore Joint Box:**
1. Klik menu "Archived" di halaman joint box
2. Pilih joint box yang akan dipulihkan
3. Klik tombol "Restore"

**Maintenance Schedule:**
- Sistem akan mengingatkan maintenance rutin
- Tracking history maintenance
- Notifikasi maintenance yang terlambat
- Export schedule maintenance

**Filter dan Pencarian:**
- Filter berdasarkan status (active/maintenance/archived)
- Filter berdasarkan lokasi
- Filter berdasarkan kabel ODC
- Filter berdasarkan tipe joint box
- Filter berdasarkan tanggal maintenance
- Pencarian berdasarkan nama joint box
- Sort berdasarkan nama, lokasi, status, tanggal maintenance

**Validasi:**
- Nama joint box harus unik
- Lokasi dan kabel ODC harus dipilih
- Validasi kapasitas sambungan
- Cek dependensi sebelum delete
- Validasi koordinat GPS
- Validasi tanggal maintenance

---

## FITUR MAPPING DAN VISUALISASI FIBER OPTIK

### 1. Akses Mapping

**Langkah-langkah:**
1. Klik menu "Mapping" di sidebar
2. Sistem akan menampilkan peta interaktif
3. Peta menampilkan semua komponen fiber optik

### 2. Fitur Visualisasi

**Komponen yang Ditampilkan:**
- **ODC**: Marker ungu dengan informasi cabinet
- **ODP**: Marker hijau dengan informasi distribusi point
- **Client**: Marker biru dengan informasi pelanggan
- **Garis Koneksi**: Garis melengkung antar komponen

**Informasi yang Ditampilkan:**
- Koordinat GPS setiap komponen
- Jarak antar komponen (dalam km)
- Status operasional
- Informasi detail saat diklik

### 3. Filter dan Pencarian

**Fitur Filter:**
1. **Filter Provinsi**: Pilih provinsi tertentu
2. **Filter Kota**: Pilih kota dalam provinsi
3. **Statistik Daerah**: Tampilkan statistik per daerah
4. **Pencarian**: Cari komponen berdasarkan nama

**Langkah-langkah Filter:**
1. Gunakan dropdown "Provinsi" untuk memilih daerah
2. Gunakan dropdown "Kota" untuk memilih kota
3. Lihat statistik di panel kanan atas
4. Gunakan search box untuk pencarian

### 4. Edit Komponen di Peta

**Fitur Edit:**
- Klik marker untuk melihat detail
- Klik tombol "Edit" untuk mengubah data
- Klik tombol "Delete" untuk menghapus
- Drag marker untuk mengubah posisi

**Langkah-langkah Edit:**
1. Klik marker komponen di peta
2. Klik tombol "Edit" pada popup
3. Ubah data yang diperlukan
4. Klik "Save" untuk menyimpan

### 5. Tambah Komponen Baru

**Langkah-langkah:**
1. Pilih tipe komponen (Client/ODP/ODC)
2. Klik di peta untuk menentukan posisi
3. Isi form data komponen
4. Klik "Save" untuk menyimpan

### 6. Export Data Mapping

**Fitur Export:**
- Export data ke CSV
- Export peta ke PDF
- Export statistik daerah

---

## FITUR WA GATEWAY

### 1. Manajemen Device

**Fitur:**
- Tambah device WhatsApp
- Koneksi via QR Code
- Status koneksi device
- Pengaturan device default

**Langkah-langkah Menambah Device:**
1. Klik menu "WA Gateway" di sidebar
2. Klik tombol "Add Device"
3. Isi form:
   - Nama device
   - Nomor telepon
4. Klik "Save"
5. Klik "Connect (QR)" untuk koneksi
6. Scan QR code dengan WhatsApp

### 2. Kirim Pesan

**Fitur:**
- Kirim pesan teks
- Kirim gambar
- Kirim dokumen
- Kirim ke multiple client
- Template pesan

**Langkah-langkah Kirim Pesan:**
1. Klik menu "WA Gateway" → "Chat"
2. Pilih device yang akan digunakan
3. Pilih client penerima
4. Pilih template pesan (opsional)
5. Tulis pesan atau upload file
6. Klik "Send"

### 3. Template Pesan

**Fitur:**
- Buat template pesan
- Variable placeholder
- Kategorisasi template
- Preview template

**Langkah-langkah Buat Template:**
1. Klik menu "WA Gateway" → "Template"
2. Klik "New Template"
3. Isi form:
   - Judul template
   - Konten pesan
   - Variable yang dapat digunakan
4. Klik "Save"

### 4. Pesan Berulang (Recurring)

**Fitur:**
- Jadwalkan pesan otomatis
- Pesan reminder pembayaran
- Pesan notifikasi invoice
- Konfigurasi frekuensi

**Langkah-langkah Buat Pesan Berulang:**
1. Klik menu "WA Gateway" → "Recurring"
2. Klik "New Recurring Message"
3. Isi form:
   - Pilih device
   - Pilih client
   - Tulis pesan
   - Set jadwal
4. Klik "Save"

### 5. Chatbot

**Fitur:**
- Auto-reply berdasarkan keyword
- FAQ otomatis
- Escalation ke admin
- Log percakapan

**Langkah-langkah Setup Chatbot:**
1. Klik menu "WA Gateway" → "Chatbot"
2. Klik "Add Chatbot"
3. Isi form:
   - Pertanyaan trigger
   - Jawaban otomatis
   - Pilih device
4. Klik "Save"

### 6. Riwayat Chat

**Fitur:**
- Lihat semua percakapan
- Filter berdasarkan device
- Filter berdasarkan status
- Export riwayat chat

**Langkah-langkah Lihat Riwayat:**
1. Klik menu "WA Gateway" → "Chat"
2. Pilih device
3. Lihat daftar percakapan
4. Klik percakapan untuk detail

### 7. Integrasi dengan Invoice

**Fitur:**
- Kirim invoice via WhatsApp
- Konfirmasi pembayaran otomatis
- Reminder jatuh tempo
- Notifikasi status invoice

**Langkah-langkah Kirim Invoice:**
1. Buka halaman invoice
2. Klik tombol "Send via WhatsApp"
3. Pilih device
4. Klik "Send"

---

## DASHBOARD DAN LAPORAN

### 1. FTTH Reports

**Fitur Laporan:**
- **Overview**: Ringkasan statistik FTTH
- **Utilization**: Analisis utilisasi infrastruktur
- **Status**: Status komponen jaringan
- **Details**: Detail hierarkis jaringan

**Langkah-langkah Akses:**
1. Klik menu "FIBER OPTIK" → "FTTH Reports"
2. Pilih tab laporan yang diinginkan
3. Gunakan filter untuk data tertentu
4. Export laporan ke CSV/PDF

#### **Tab Overview**

**Fitur Overview:**
- **Summary Cards**: Kartu ringkasan total komponen
- **Bar Charts**: Grafik distribusi ODP per ODC dan client per ODP
- **Network Coverage**: Informasi panjang kabel dan client terhubung
- **Export Options**: Export data ke CSV/PDF

**Komponen yang Ditampilkan:**
1. **Summary Cards:**
   - Total Lokasi (dengan ikon dan warna biru)
   - Total ODC (dengan ikon dan warna hijau)
   - Total ODP (dengan ikon dan warna ungu)
   - Total Kabel ODC (dengan ikon dan warna kuning)
   - Total Kabel Length (dalam meter, dengan ikon dan warna oranye)
   - Total Tubes (dengan ikon dan warna merah)
   - Total Cores (dengan ikon dan warna indigo)
   - Total Client FTTH (dengan ikon dan warna teal)

2. **Bar Charts:**
   - **ODPs per ODC**: Menampilkan distribusi jumlah ODP pada setiap ODC
   - **Clients per ODP**: Menampilkan distribusi jumlah client pada setiap ODP

3. **Network Coverage Card:**
   - Total panjang kabel fiber optik (dalam meter)
   - Jumlah client yang terhubung
   - Persentase coverage area

**Cara Menggunakan Overview:**
1. Lihat summary cards untuk gambaran cepat infrastruktur
2. Analisis grafik untuk melihat distribusi komponen
3. Klik pada kartu untuk melihat detail lebih lanjut
4. Gunakan tombol export untuk mengunduh data

#### **Tab Utilization**

**Fitur Utilization:**
- **Summary Cards**: Kartu ringkasan utilisasi
- **Pie Charts**: Grafik utilisasi core, tube, dan ODP
- **Utilization Metrics**: Metrik utilisasi real-time
- **Export Options**: Export data ke CSV/PDF

**Komponen yang Ditampilkan:**
1. **Summary Cards:**
   - Total Cores (dengan persentase utilisasi)
   - Assigned Cores (core yang sudah terpakai)
   - Total Tubes (dengan persentase utilisasi)
   - Used Tubes (tube yang sudah terpakai)
   - Total ODPs (dengan persentase utilisasi)
   - ODPs with Client (ODP yang sudah terhubung client)
   - Core Utilization (%) (persentase utilisasi core)
   - Tube Utilization (%) (persentase utilisasi tube)
   - ODP Utilization (%) (persentase utilisasi ODP)

2. **Pie Charts:**
   - **Core Utilization**: Menampilkan distribusi core yang assigned vs unassigned
   - **Tube Utilization**: Menampilkan distribusi tube yang used vs unused
   - **ODP Utilization**: Menampilkan distribusi ODP yang with client vs no client

**Cara Menggunakan Utilization:**
1. Lihat summary cards untuk metrik utilisasi utama
2. Analisis pie charts untuk melihat distribusi utilisasi
3. Identifikasi bottleneck dalam infrastruktur
4. Gunakan data untuk perencanaan ekspansi

#### **Tab Status**

**Fitur Status:**
- **Summary Cards**: Kartu ringkasan status komponen
- **Status Charts**: Grafik status distribution
- **Status Breakdown**: Breakdown status per komponen
- **Export Options**: Export data ke CSV/PDF

**Komponen yang Ditampilkan:**
1. **Summary Cards:**
   - Total Lokasi vs Active Lokasi
   - Total ODC vs Active ODC
   - Total ODP vs Active ODP
   - Total Kabel vs Active Kabel
   - Total Clients vs Active Clients

2. **Status Charts:**
   - **Lokasi Status**: Pie chart status lokasi (active/archived)
   - **ODC Status**: Pie chart status ODC (active/archived)
   - **ODP Status**: Pie chart status ODP (active/archived)
   - **Kabel Status**: Pie chart status kabel (active/archived)
   - **Client Status**: Pie chart status client (active/inactive/archived)
   - **Joint Box Status**: Pie chart status joint box (active/maintenance/archived)

3. **Status Breakdown:**
   - Breakdown status untuk setiap komponen
   - Persentase komponen aktif vs nonaktif
   - Trend status over time

**Cara Menggunakan Status:**
1. Lihat summary cards untuk status operasional
2. Analisis pie charts untuk distribusi status
3. Identifikasi komponen yang perlu maintenance
4. Track trend status untuk perencanaan

#### **Tab Details**

**Fitur Details:**
- **Hierarchical View**: Tampilan hierarkis jaringan
- **Drill-down Capability**: Kemampuan drill-down ke detail
- **Component Details**: Detail setiap komponen
- **Export Options**: Export data ke CSV/PDF

**Struktur Hierarkis:**
1. **Lokasi** (Level 1)
   - Informasi: Nama lokasi, deskripsi, koordinat, status
   - Sub-komponen: ODC, ODP, Client FTTH, Joint Box

2. **ODC** (Level 2)
   - Informasi: Nama ODC, lokasi, kapasitas, status
   - Sub-komponen: Kabel ODC

3. **Kabel ODC** (Level 3)
   - Informasi: Nama kabel, tipe, panjang, spesifikasi
   - Sub-komponen: Tube Kabel

4. **Tube Kabel** (Level 4)
   - Informasi: Warna tube, nomor, status
   - Sub-komponen: Core Kabel

5. **Core Kabel** (Level 5)
   - Informasi: Warna core, status, ODP terhubung
   - Sub-komponen: ODP

6. **ODP** (Level 6)
   - Informasi: Nama ODP, tipe splitter, kapasitas, status
   - Sub-komponen: Client FTTH

7. **Client FTTH** (Level 7)
   - Informasi: Nama client, paket layanan, status, alamat

**Cara Menggunakan Details:**
1. **Expand/Collapse**: Klik pada komponen untuk expand/collapse
2. **Drill-down**: Klik pada sub-komponen untuk melihat detail
3. **Search**: Gunakan search untuk menemukan komponen spesifik
4. **Filter**: Filter berdasarkan status, lokasi, atau tipe
5. **Export**: Export data hierarkis ke CSV/PDF

**Fitur Drill-down:**
- Klik pada lokasi untuk melihat ODC di lokasi tersebut
- Klik pada ODC untuk melihat kabel yang terhubung
- Klik pada kabel untuk melihat tube dalam kabel
- Klik pada tube untuk melihat core dalam tube
- Klik pada core untuk melihat ODP yang terhubung
- Klik pada ODP untuk melihat client yang terhubung

**Informasi Detail yang Ditampilkan:**
- **Identifikasi**: Nama, ID, kode
- **Spesifikasi Teknis**: Tipe, kapasitas, dimensi
- **Status**: Active, archived, maintenance
- **Koordinat**: Latitude, longitude
- **Tanggal**: Instalasi, maintenance, update
- **Hubungan**: Komponen yang terhubung
- **Utilisasi**: Persentase penggunaan
- **Catatan**: Deskripsi, catatan teknis

**Export Options:**
- **CSV Export**: Export data dalam format CSV
- **PDF Export**: Export laporan dalam format PDF
- **Filtered Export**: Export data berdasarkan filter yang diterapkan
- **Hierarchical Export**: Export data dengan struktur hierarkis

### 2. Dashboard FTTH

**Komponen Dashboard:**
- Total lokasi, ODC, ODP, kabel
- Panjang kabel total
- Jumlah client FTTH
- Grafik utilisasi
- Statistik per daerah

### 3. Laporan Utilisasi

**Metrik yang Ditampilkan:**
- Utilisasi core kabel
- Utilisasi tube kabel
- Utilisasi ODP
- Grafik pie chart
- Trend utilisasi

### 4. Laporan Status

**Status Komponen:**
- Status aktif/nonaktif
- Breakdown per komponen
- Grafik status distribution
- Filter berdasarkan status

---

## PENGATURAN SISTEM

### 1. Pengaturan User

**Fitur:**
- Tambah/edit user
- Set permission
- Role management
- Password management

### 2. Pengaturan Company

**Fitur:**
- Informasi perusahaan
- Logo dan branding
- Pengaturan invoice
- Template dokumen

### 3. Pengaturan Payment Gateway

**Fitur:**
- Konfigurasi gateway pembayaran
- Test koneksi
- Webhook setup
- Fee configuration

### 4. Backup dan Restore

**Fitur:**
- Backup database otomatis
- Export data
- Import data
- Restore sistem

---

## TROUBLESHOOTING

### 1. Masalah Login
- Periksa kredensial email/password
- Clear cache browser
- Hubungi admin sistem

### 2. Masalah WA Gateway
- Periksa koneksi internet
- Pastikan device terhubung
- Restart device WhatsApp
- Periksa log error

### 3. Masalah Mapping
- Periksa koordinat GPS
- Refresh halaman mapping
- Clear cache browser
- Periksa data lokasi

### 4. Masalah FTTH Reports
- Periksa data yang diinput
- Refresh halaman
- Periksa permission user
- Hubungi technical support

---

## KONTAK SUPPORT

Untuk bantuan teknis dan pertanyaan lebih lanjut, silakan hubungi:

- **Email**: support@invoice-isp.com
- **WhatsApp**: +62-xxx-xxxx-xxxx
- **Telepon**: +62-xxx-xxxx-xxxx
- **Jam Kerja**: Senin-Jumat 08:00-17:00 WIB

---

*Dokumen ini diperbarui terakhir pada: [Tanggal]*
*Versi: 1.0* 
