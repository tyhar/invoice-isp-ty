# Invoice ISP - Sistem Manajemen Jaringan Fiber Optik

<p align="center">
<img src="https://raw.githubusercontent.com/invoiceninja/invoiceninja/master/public/images/round_logo.png" alt="Logo Invoice ISP" width="200"/>
</p>

<p align="center">
<strong>Platform Manajemen Bisnis ISP Lengkap dengan Infrastruktur FTTH & Integrasi WhatsApp</strong>
</p>

---

## 🚀 Apa itu Invoice ISP?

**Invoice ISP** adalah platform manajemen bisnis komprehensif yang dirancang khusus untuk Internet Service Provider (ISP) yang menggabungkan kemampuan penagihan tradisional dengan manajemen infrastruktur fiber optik tingkat lanjut dan alat komunikasi pelanggan.

Dibangun di atas fondasi Invoice Ninja yang kokoh, aplikasi ini memperluas fungsionalitas inti dengan modul khusus untuk manajemen infrastruktur FTTH (Fiber to the Home), visualisasi jaringan, dan integrasi WhatsApp untuk komunikasi pelanggan.

---

## 🎯 Fitur Utama

### 📊 **Manajemen Bisnis Inti**
- **Manajemen Invoice**: Buat, kirim, dan lacak invoice dengan penagihan otomatis
- **Manajemen Klien**: Database pelanggan komprehensif dengan riwayat layanan
- **Pemrosesan Pembayaran**: Integrasi multiple gateway pembayaran
- **Laporan Keuangan**: Analisis arus kas, pelacakan pendapatan, dan wawasan keuangan
- **Katalog Produk/Layanan**: Kelola paket internet dan layanan tambahan

### 🌐 **Manajemen Infrastruktur FTTH**
- **Topologi Jaringan**: Pemetaan dan manajemen jaringan fiber optik lengkap
- **Pelacakan Komponen**: Kelola ODC, ODP, kabel, tube, core, dan koneksi pelanggan
- **Dukungan Geolokasi**: Koordinat GPS dan geocoding alamat untuk semua komponen jaringan
- **Perencanaan Kapasitas**: Monitoring utilisasi real-time dan analisis kapasitas
- **Penjadwalan Maintenance**: Lacak joint box dan aktivitas maintenance

### 🗺️ **Visualisasi & Pemetaan Jaringan**
- **Peta Interaktif**: Representasi visual infrastruktur jaringan menggunakan Leaflet.js
- **Marker Komponen**: Marker berwarna untuk lokasi ODC, ODP, dan pelanggan
- **Garis Koneksi**: Representasi visual koneksi fiber dengan perhitungan jarak
- **Filter & Pencarian**: Filter berdasarkan provinsi, kota, atau tipe komponen
- **Kemampuan Export**: Export data jaringan ke format CSV/PDF

### 📱 **Integrasi Gateway WhatsApp**
- **Dukungan Multi-Device**: Kelola multiple device WhatsApp
- **Template Pesan**: Template pesan yang telah ditentukan dengan placeholder variabel
- **Pesan Massal**: Kirim pesan ke multiple pelanggan secara bersamaan
- **Notifikasi Otomatis**: Reminder invoice, konfirmasi pembayaran, dan update layanan
- **Dukungan Chatbot**: Respons otomatis dan penanganan FAQ
- **Riwayat Pesan**: Pelacakan percakapan dan analitik lengkap

### 📈 **Laporan & Analitik Tingkat Lanjut**
- **Laporan FTTH**: 4 tab laporan komprehensif (Overview, Utilization, Status, Details)
- **Statistik Jaringan**: Metrik utilisasi infrastruktur real-time
- **Analitik Pelanggan**: Pola penggunaan layanan dan wawasan perilaku pelanggan
- **Analitik Keuangan**: Analisis pendapatan dan metrik performa bisnis
- **Export & Integrasi**: Kemampuan export data untuk analisis eksternal

---

## 🏗️ Arsitektur Sistem

### **Backend (Laravel 10)**
- Arsitektur API RESTful
- Database MySQL dengan relasi yang dioptimalkan
- Pemrosesan data real-time dan kalkulasi
- Autentikasi dan otorisasi yang aman
- Dukungan webhook untuk integrasi eksternal

### **Frontend (React + TypeScript)**
- Antarmuka pengguna modern dan responsif
- Visualisasi data interaktif dengan grafik
- Update real-time dan notifikasi
- Desain yang ramah mobile
- Kemampuan Progressive Web App

### **Skema Database**
```
Hierarki Infrastruktur FTTH:
Lokasi → ODC (Optical Distribution Cabinet) → 
Kabel ODC → Tube Kabel → Core Kabel → 
ODP (Optical Distribution Point) → Client FTTH (Pelanggan)
```

---

## 🚀 Mulai Cepat

### Prasyarat
- PHP 8.1+
- MySQL 8.0+
- Node.js 16+
- Composer
- Git

### Instalasi

1. **Clone repository**
```bash
git clone https://github.com/your-username/invoice-isp.git
cd invoice-isp
```

2. **Install dependensi PHP**
```bash
composer install --optimize-autoloader --no-dev
```

3. **Install dependensi Node.js**
```bash
cd client
npm install
npm run build
cd ..
```

4. **Setup environment**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Setup database**
```bash
php artisan migrate
php artisan db:seed
```

6. **Jalankan aplikasi**
```bash
php artisan serve
```

### Kredensial Login Default
- **Admin**: `admin@example.com` / `password`
- **Portal Klien**: `client@example.com` / `password`

---

## 📋 Persyaratan Sistem

### **Persyaratan Minimum**
- **Server**: 2GB RAM, 20GB Storage
- **PHP**: 8.1+ dengan ekstensi (BCMath, Ctype, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML)
- **Database**: MySQL 8.0+ atau MariaDB 10.3+
- **Web Server**: Apache 2.4+ atau Nginx 1.18+

### **Persyaratan yang Direkomendasikan**
- **Server**: 4GB RAM, 50GB SSD Storage
- **PHP**: 8.2+ dengan OPcache diaktifkan
- **Database**: MySQL 8.0+ dengan engine InnoDB
- **Web Server**: Nginx dengan PHP-FPM
- **Sertifikat SSL**: Untuk deployment produksi

---

## 🔧 Konfigurasi

### **Variabel Environment**
```env
# Konfigurasi Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=invoice_isp
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Konfigurasi Gateway WhatsApp
WA_SERVICE_URL=http://localhost:3000
WA_SERVICE_TOKEN=your_wa_token

# API Google Maps (untuk geocoding)
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Konfigurasi Gateway Pembayaran
STRIPE_KEY=your_stripe_key
STRIPE_SECRET=your_stripe_secret
```

### **Setup Gateway WhatsApp**
1. Konfigurasi URL layanan WhatsApp di `.env`
2. Setup device WhatsApp di panel admin
3. Scan QR code untuk menghubungkan device
4. Konfigurasi template pesan dan chatbot

---

## 📊 Manajemen Infrastruktur FTTH

### **Komponen Jaringan**

#### **Lokasi**
- Lokasi geografis dengan koordinat GPS
- Informasi alamat dengan geocoding
- Pelacakan status (aktif/arsip)

#### **ODC (Optical Distribution Cabinet)**
- Titik distribusi pusat
- Manajemen kapasitas dan pelacakan utilisasi
- Koneksi ke multiple ODP

#### **Kabel ODC**
- Spesifikasi kabel fiber optik
- Informasi panjang, tipe, dan kapasitas
- Organisasi tube dan core

#### **Tube Kabel**
- Identifikasi tube dengan kode warna
- Organisasi core dalam tube
- Pelacakan kapasitas dan utilisasi

#### **Core Kabel**
- Manajemen core fiber individual
- Status koneksi ke ODP
- Kode warna dan identifikasi

#### **ODP (Optical Distribution Point)**
- Titik distribusi lokal
- Konfigurasi splitter dan kapasitas
- Manajemen koneksi pelanggan

#### **Client FTTH (Pelanggan)**
- Informasi pelanggan dan detail layanan
- Integrasi paket dan penagihan
- Status koneksi dan riwayat

---

## 🗺️ Pemetaan & Visualisasi

### **Peta Jaringan Interaktif**
- **Visualisasi Real-time**: Tampilan topologi jaringan langsung
- **Marker Komponen**: Marker berwarna untuk komponen berbeda
- **Garis Koneksi**: Representasi visual koneksi fiber
- **Perhitungan Jarak**: Perhitungan jarak otomatis antar komponen
- **Opsi Filter**: Filter berdasarkan lokasi, tipe komponen, atau status

### **Fitur Geolokasi**
- **Integrasi GPS**: Penempatan komponen berbasis koordinat
- **Geocoding Alamat**: Generasi koordinat otomatis dari alamat
- **Manajemen Pusat Peta**: Titik pusat peta yang dapat dikonfigurasi
- **Kemampuan Export**: Export data peta dan statistik

---

## 📱 Fitur Gateway WhatsApp

### **Manajemen Device**
- **Dukungan Multi-Device**: Kelola multiple device WhatsApp
- **Status Koneksi**: Monitoring koneksi device real-time
- **Autentikasi QR Code**: Koneksi device yang aman via QR code
- **Device Default**: Set device utama untuk pesan otomatis

### **Manajemen Pesan**
- **Sistem Template**: Template pesan yang telah ditentukan dengan variabel
- **Pesan Massal**: Kirim pesan ke multiple pelanggan
- **Lampiran File**: Dukungan untuk gambar, dokumen, dan PDF
- **Riwayat Pesan**: Pelacakan percakapan lengkap
- **Status Pengiriman**: Pelacakan status pengiriman pesan real-time

### **Fitur Otomatisasi**
- **Notifikasi Invoice**: Pengiriman invoice otomatis via WhatsApp
- **Reminder Pembayaran**: Pesan reminder pembayaran terjadwal
- **Update Layanan**: Notifikasi status layanan otomatis
- **Integrasi Chatbot**: Respons FAQ dan dukungan otomatis

---

## 📈 Laporan & Analitik

### **Dashboard Laporan FTTH**

#### **Tab Overview**
- Kartu ringkasan untuk semua komponen jaringan
- Grafik batang menunjukkan pola distribusi
- Statistik coverage jaringan
- Kemampuan export untuk analisis data

#### **Tab Utilization**
- Metrik utilisasi kapasitas real-time
- Grafik pie untuk utilisasi core, tube, dan ODP
- Alat identifikasi bottleneck
- Wawasan perencanaan kapasitas

#### **Tab Status**
- Distribusi status komponen
- Pelacakan komponen aktif vs arsip
- Overview penjadwalan maintenance
- Analisis trend status

#### **Tab Details**
- Tampilan jaringan hierarkis
- Kemampuan drill-down untuk analisis detail
- Pemetaan relasi komponen
- Opsi export data komprehensif

---

## 🔒 Fitur Keamanan

### **Autentikasi & Otorisasi**
- Kontrol akses berbasis peran (RBAC)
- Dukungan autentikasi multi-faktor
- Manajemen sesi dan keamanan
- Autentikasi token API

### **Perlindungan Data**
- Penyimpanan data terenkripsi
- Komunikasi API yang aman
- Fitur kepatuhan GDPR
- Update keamanan berkala

---

## 🚀 Opsi Deployment

### **Deployment Self-Hosted**
- Kontrol penuh atas data dan infrastruktur
- Branding dan fitur yang dapat dikustomisasi
- Tidak ada biaya berlangganan berulang
- Kepemilikan data lengkap

### **Deployment Cloud**
- Infrastruktur cloud yang dapat diskalakan
- Backup dan monitoring otomatis
- Ketersediaan tinggi dan performa
- Update keamanan yang dikelola

### **Deployment Docker**
```bash
# Menggunakan Docker Compose
docker-compose up -d

# Menggunakan image Docker Hub
docker pull invoice-isp/latest
docker run -d -p 8000:8000 invoice-isp
```

---

## 🤝 Berkontribusi

Kami menyambut kontribusi untuk meningkatkan Invoice ISP! Silakan baca panduan kontribusi kami:

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/fitur-menakjubkan`)
3. Commit perubahan Anda (`git commit -m 'Tambah fitur menakjubkan'`)
4. Push ke branch (`git push origin feature/fitur-menakjubkan`)
5. Buka Pull Request

### **Setup Development**
```bash
# Install dependensi development
composer install
npm install

# Jalankan server development
php artisan serve
npm run dev

# Jalankan test
php artisan test
npm run test
```

---

## 📚 Dokumentasi

- **[Manual Pengguna](BUKU_MANUAL_SISTEM_INVOICE_ISP.md)**: Panduan pengguna komprehensif dalam bahasa Indonesia
- **[Dokumentasi API](openapi/api-docs.yaml)**: Referensi API lengkap
- **[Panduan Developer](docs/developer-guide.md)**: Dokumentasi teknis untuk developer
- **[Panduan Instalasi](docs/installation.md)**: Instruksi instalasi detail

---

## 🆘 Dukungan

### **Dukungan Komunitas**
- **GitHub Issues**: Laporkan bug dan minta fitur
- **Discussions**: Diskusi komunitas dan Q&A
- **Wiki**: Dokumentasi yang dikelola komunitas

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah Elastic License 2.0 - lihat file [LICENSE](LICENSE) untuk detail.

### **Lisensi Komersial**
- **White-label License**: $30/tahun untuk menghapus branding
- **Enterprise Support**: Harga khusus untuk deployment enterprise
- **Custom Development**: Solusi yang disesuaikan untuk kebutuhan spesifik

---

## 🙏 Ucapan Terima Kasih

- **Tim Invoice Ninja**: Untuk fondasi yang kokoh dan fungsionalitas inti
- **Komunitas Laravel**: Untuk framework PHP yang luar biasa
- **Komunitas React**: Untuk framework frontend yang powerful
- **Kontributor Open Source**: Untuk berbagai library dan tools yang digunakan
