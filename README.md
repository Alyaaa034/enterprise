Sistem E-Commerce Berbasis Microservices
1. Deskripsi Proyek
Sistem E-Commerce Berbasis Microservices merupakan aplikasi backend sederhana yang membagi fungsi e-commerce ke dalam beberapa layanan terpisah. Setiap layanan memiliki tanggung jawab dan penyimpanan data masing-masing serta berkomunikasi melalui REST API.

Repository ini terdiri dari empat layanan utama:
- Product Service untuk mengelola data produk.
- Cart Service untuk mengelola keranjang belanja pengguna.
- Review Service untuk mengelola ulasan produk.
- Order Service untuk memproses dan mengelola pesanan.
Pengembangan dan dokumentasi tugas ini berfokus pada Order Service. Layanan tersebut mengambil data keranjang dari Cart Service, memeriksa informasi produk melalui Product Service, menyimpan pesanan ke database sendiri, menyediakan riwayat pesanan, dan mengubah status pembayaran.
2. Arsitektur Sistem
2.1 Komponen sistem
- Layanan — Product Service
  - Tanggung jawab: Data produk, harga, dan stok
  - Teknologi / penyimpanan: Node.js, MySQL
- Layanan — Cart Service
  - Tanggung jawab: Data keranjang dan item keranjang
  - Teknologi / penyimpanan: Laravel, PostgreSQL
- Layanan — Review Service
  - Tanggung jawab: Data ulasan produk
  - Teknologi / penyimpanan: Python/Flask, MongoDB
- Layanan — Order Service
  - Tanggung jawab: Checkout, data pesanan, detail pesanan, dan status pembayaran
  - Teknologi / penyimpanan: Laravel, MySQL
Setiap service mengelola databasenya sendiri. Order Service tidak membaca atau mengubah database milik Product Service maupun Cart Service secara langsung.
2.2 Diagram komunikasi checkout
                         Pengguna / API Client
                                  |
                                  | POST /orders
                                  v
                         +------------------+
                         |   Order Service  |
                         |   Laravel :3003  |
                         +------------------+
                           |              |
               GET /carts  |              | GET /products/{id}
               DELETE cart |              |
                           v              v
                  +----------------+  +------------------+
                  |  Cart Service  |  |  Product Service |
                  | Laravel :3001 |  |   Node.js :3000  |
                  +----------------+  +------------------+
                           |              |
                           v              v
                  +----------------+  +------------------+
                  |   PostgreSQL   |  |      MySQL       |
                  +----------------+  +------------------+

                         Order Service
                               |
                               | Simpan pesanan dan item
                               v
                       +------------------+
                       |   MySQL orderdb  |
                       +------------------+

                  +----------------------+
                  |    Review Service    |
                  | Python/Flask :3002   |
                  +----------------------+
                               |
                               v
                           MongoDB
Review Service merupakan layanan terpisah untuk pengelolaan ulasan produk dan tidak terlibat langsung dalam alur checkout Order Service.
2.3 Alur komunikasi checkout
1. API Client mengirim permintaan POST /orders berisi user_id ke Order Service.
2. Order Service memvalidasi request.
3. Order Service meminta data keranjang pengguna kepada Cart Service.
4. Order Service memeriksa apakah keranjang memiliki item.
5. Untuk setiap item, Order Service meminta informasi produk kepada Product Service.
6. Order Service memeriksa keberadaan produk dan kecukupan stok.
7. Order Service menghitung subtotal dan total pesanan berdasarkan harga produk yang diterima.
8. Order Service menyimpan data pesanan dan detail item dalam satu database transaction.
9. Setelah penyimpanan berhasil, Order Service meminta Cart Service mengosongkan keranjang.
10. Order Service mengembalikan respons 201 Created.
Jika pengosongan keranjang gagal setelah pesanan tersimpan, pesanan tetap dipertahankan dan kegagalan dicatat melalui logging.
3. Teknologi yang Digunakan
- PHP dan Laravel untuk Order Service dan Cart Service.
- Node.js untuk Product Service.
- Python dan Flask untuk Review Service.
- MySQL 8.4 untuk database Product Service dan Order Service.
- PostgreSQL 16 untuk database Cart Service.
- MongoDB 7 untuk database Review Service.
- Docker dan Docker Compose untuk menjalankan layanan dan database dalam container.
- REST API untuk komunikasi antarservice.
- Insomnia untuk pengujian endpoint.
4. Struktur Repository
Struktur utama repository:
enterprise/
├── product-service/
│   ├── database/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── cart-service/
│   ├── app/
│   ├── routes/
│   ├── database/
│   ├── artisan
│   └── Dockerfile
├── review-service/
│   ├── run.py
│   ├── requirements.txt
│   └── Dockerfile
├── order-service/
│   ├── app/
│   │   ├── Exceptions/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   └── Requests/
│   │   ├── Models/
│   │   └── Services/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   │   └── migrations/
│   ├── routes/
│   │   └── api.php
│   ├── .env.example
│   ├── artisan
│   ├── composer.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
4.1 Komponen penting Order Service
- routes/api.php: mendefinisikan endpoint API.
- app/Http/Controllers/OrderController.php: menerima request, memanggil service, dan mengembalikan respons JSON.
- app/Http/Requests/CreateOrderRequest.php: memvalidasi request pembuatan pesanan.
- app/Http/Requests/ListUserOrdersRequest.php: memvalidasi filter status pesanan.
- app/Services/OrderService.php: menjalankan proses checkout.
- app/Services/OrderQueryService.php: mengambil detail dan daftar pesanan.
- app/Services/PaymentService.php: mengubah status pesanan menjadi PAID.
- app/Services/CartServiceClient.php: berkomunikasi dengan Cart Service.
- app/Services/ProductService.php: berkomunikasi dengan Product Service.
- app/Models/Order.php dan app/Models/OrderItem.php: merepresentasikan tabel pesanan dan detail pesanan.
- database/migrations/: mendefinisikan struktur tabel database.
5. Order Service
5.1 Fitur
Order Service menyediakan fungsi berikut:
- Membuat pesanan berdasarkan keranjang pengguna.
- Memeriksa keranjang kosong atau berisi item.
- Memeriksa keberadaan produk.
- Memvalidasi jumlah pembelian terhadap stok produk.
- Menghitung subtotal dan total pesanan.
- Menyimpan pesanan beserta detail item.
- Menyimpan snapshot nama dan harga produk.
- Menampilkan detail pesanan berdasarkan ID.
- Menampilkan daftar pesanan berdasarkan pengguna.
- Memfilter daftar pesanan berdasarkan status.
- Mengubah status pesanan dari PENDING menjadi PAID.
5.2 Struktur database
Order Service menggunakan database MySQL bernama orderdb dengan dua tabel utama.

Tabel orders
- id: Identitas unik pesanan.
- user_id: Identitas pengguna yang membuat pesanan.
- total_amount: Total nilai pesanan.
- status: Status pesanan, yaitu PENDING atau PAID.
- created_at: Waktu pembuatan data.
- updated_at: Waktu terakhir data diperbarui.
Tabel order_items
- id: Identitas unik detail pesanan.
- order_id: Relasi ke tabel orders.
- product_id: Identitas produk dari Product Service.
- product_name: Nama produk ketika pesanan dibuat.
- unit_price: Harga satuan produk ketika pesanan dibuat.
- quantity: Jumlah produk yang dipesan.
- subtotal: Hasil perkalian harga satuan dan jumlah produk.
- created_at: Waktu pembuatan data.
- updated_at: Waktu terakhir data diperbarui.
Satu data pada tabel orders dapat memiliki beberapa data pada tabel order_items. Relasi detail pesanan menggunakan order_id dengan penghapusan berantai (cascade delete).
5.3 Snapshot produk
Ketika pesanan dibuat, Order Service menyimpan product_name dan unit_price ke tabel order_items. Data tersebut merupakan snapshot informasi produk pada saat checkout.

Dengan cara ini, rincian pesanan tetap menunjukkan nama dan harga saat transaksi dibuat, meskipun informasi produk pada Product Service berubah setelahnya.
5.4 Proses checkout dan konsistensi data
Pemeriksaan keranjang dan produk dilakukan sebelum penyimpanan pesanan. Setelah seluruh item dinyatakan valid, data pesanan dan detail item disimpan menggunakan database transaction. Dengan demikian, data pesanan dan detailnya disimpan sebagai satu kesatuan.

Pengosongan keranjang dilakukan setelah transaksi database berhasil. Jika Cart Service gagal mengosongkan keranjang, pesanan yang sudah tersimpan tidak dibatalkan. Kegagalan tersebut dilaporkan melalui mekanisme logging.
5.5 Status pesanan
- PENDING: pesanan sudah dibuat dan menunggu pembayaran.
- PAID: pesanan sudah ditandai sebagai dibayar.
Endpoint pembayaran hanya mengizinkan perubahan dari PENDING menjadi PAID. Permintaan pembayaran ulang terhadap pesanan yang sudah PAID ditolak dengan status 409 Conflict.
6. Persyaratan Sistem
Sebelum menjalankan repository, siapkan:
- Git.
- Docker Desktop yang sudah berjalan.
- Docker Compose.
- Insomnia atau aplikasi API client sejenis.
Port host yang digunakan oleh konfigurasi Docker Compose:
- Product Service: 3000
- Cart Service: 3001
- Review Service: 3002
- Order Service: 3003
- PostgreSQL Cart Service: 5432
- MongoDB Review Service: 27017
- MySQL Order Service: 3307
Product Service dan Order Service menggunakan database MySQL internal pada port container 3306. Port MySQL Product Service tidak dipublikasikan ke host pada konfigurasi Compose.

Pastikan port yang diperlukan belum digunakan aplikasi lain.
7. Instalasi dan Menjalankan Proyek
7.1 Clone repository
git clone https://github.com/Alyaaa034/enterprise.git
cd enterprise
7.2 Persiapan volume PostgreSQL Cart Service
Konfigurasi docker-compose.yml menggunakan external Docker volume dengan nama berikut:
bacc4f991a8d49bc812ce538d2b5130ea5f84ce79f9ffe34e4f04fde957fcad7
Pada mesin yang belum memiliki volume tersebut, buat terlebih dahulu:
docker volume create bacc4f991a8d49bc812ce538d2b5130ea5f84ce79f9ffe34e4f04fde957fcad7
Langkah ini diperlukan karena volume PostgreSQL Cart Service dideklarasikan sebagai external pada Docker Compose.
7.3 Menjalankan seluruh service
Dari direktori root repository, jalankan:
docker compose up --build -d
Perintah tersebut membangun image yang diperlukan dan menjalankan seluruh container di latar belakang.

Periksa status container:
docker compose ps
Tunggu hingga database berstatus sehat (healthy) dan service berjalan.
7.4 Memeriksa Order Service
Buka alamat berikut:
http://localhost:3003/health
Atau kirim request:
GET http://localhost:3003/health
Respons yang diharapkan:
{
  "status": "ok",
  "service": "order-service"
}
7.5 Melihat log
Melihat log seluruh service:
docker compose logs
Melihat log Order Service saja:
docker compose logs -f order-service
Melihat log service lain, misalnya:
docker compose logs -f product-service
docker compose logs -f cart-service
7.6 Menghentikan service
Untuk menghentikan container tanpa menghapus volume database:
docker compose down
Perintah docker compose down tidak menghapus volume database. Hindari docker compose down -v jika data pengujian masih diperlukan.
8. Konfigurasi Environment
Order Service membaca konfigurasi melalui environment variable. Pada Docker Compose, nilai runtime utama diberikan melalui bagian environment pada service order-service.
- Variabel — APP_ENV
  - Fungsi: Lingkungan aplikasi
  - Nilai pada Docker Compose: local
- Variabel — APP_DEBUG
  - Fungsi: Mengaktifkan detail debug
  - Nilai pada Docker Compose: true
- Variabel — APP_KEY
  - Fungsi: Kunci aplikasi Laravel
  - Nilai pada Docker Compose: Diisi pada konfigurasi Compose
- Variabel — DB_CONNECTION
  - Fungsi: Driver database
  - Nilai pada Docker Compose: mysql
- Variabel — DB_HOST
  - Fungsi: Host database internal
  - Nilai pada Docker Compose: order-db
- Variabel — DB_PORT
  - Fungsi: Port database internal
  - Nilai pada Docker Compose: 3306
- Variabel — DB_DATABASE
  - Fungsi: Nama database
  - Nilai pada Docker Compose: orderdb
- Variabel — DB_USERNAME
  - Fungsi: Pengguna database
  - Nilai pada Docker Compose: appuser
- Variabel — DB_PASSWORD
  - Fungsi: Kata sandi database
  - Nilai pada Docker Compose: password
- Variabel — CACHE_STORE
  - Fungsi: Penyimpanan cache
  - Nilai pada Docker Compose: file
- Variabel — SESSION_DRIVER
  - Fungsi: Penyimpanan session
  - Nilai pada Docker Compose: file
- Variabel — QUEUE_CONNECTION
  - Fungsi: Driver queue
  - Nilai pada Docker Compose: sync
- Variabel — PRODUCT_SERVICE_URL
  - Fungsi: Alamat Product Service dari dalam jaringan Docker
  - Nilai pada Docker Compose: http://product-service:3000
- Variabel — CART_SERVICE_URL
  - Fungsi: Alamat Cart Service dari dalam jaringan Docker
  - Nilai pada Docker Compose: http://cart-service:3001
URL service menggunakan nama service Docker, bukan localhost, karena komunikasi berlangsung di jaringan internal Docker Compose.

File order-service/.env.example merupakan contoh konfigurasi aplikasi Laravel. Konfigurasi runtime container pada proyek ini terutama disediakan oleh docker-compose.yml.

Jangan memasukkan file .env yang berisi kredensial pribadi atau informasi rahasia ke repository publik.
9. Dokumentasi Endpoint API
Base URL Order Service:
http://localhost:3003
Endpoint API pada proyek ini menggunakan path tanpa prefix /api.
9.1 Health Check
Request
GET /health
Memeriksa apakah Order Service dapat diakses.

Respons berhasil — 200 OK
{
  "status": "ok",
  "service": "order-service"
}
9.2 Membuat Pesanan
Request
POST /orders
Content-Type: application/json
Request body
{
  "user_id": 1
}
Order Service mengambil item keranjang untuk user_id tersebut, memeriksa produk dan stok, kemudian menyimpan pesanan.

Respons berhasil — 201 Created

Contoh bentuk respons:
{
  "message": "Pesanan berhasil dibuat.",
  "data": {
    "id": 3,
    "user_id": "1",
    "total_amount": "4000000.00",
    "status": "PENDING",
    "items": [
      {
        "id": 3,
        "order_id": 3,
        "product_id": 3,
        "product_name": "Acer Aspire",
        "unit_price": "4000000.00",
        "quantity": 1,
        "subtotal": "4000000.00"
      }
    ]
  }
}
Nilai ID, nama produk, harga, jumlah, dan total pada contoh merupakan ilustrasi respons; hasil aktual mengikuti data Cart Service dan Product Service saat request dikirim.

Kemungkinan status respons
- 201 Created: pesanan berhasil dibuat.
- 422 Unprocessable Entity: user_id tidak diberikan atau tidak valid.
- 409 Conflict: keranjang kosong, data item keranjang tidak valid, produk tidak ditemukan, atau stok tidak mencukupi.
- 503 Service Unavailable: Cart Service atau Product Service tidak dapat dihubungi atau mengalami gangguan.
- 500 Internal Server Error: terjadi kesalahan internal.
Contoh respons validasi 422:
{
  "message": "User ID wajib diisi."
}
Contoh respons konflik 409:
{
  "message": "Keranjang belanja kosong."
}
Contoh respons gangguan service 503:
{
  "message": "Layanan produk atau keranjang sedang bermasalah."
}
9.3 Melihat Detail Pesanan
Request
GET /orders/{id}
Contoh:
GET /orders/3
Mengambil data pesanan beserta rincian item berdasarkan ID pesanan.

Respons berhasil — 200 OK
{
  "message": "Detail pesanan berhasil diambil.",
  "data": {
    "id": 3,
    "user_id": "1",
    "total_amount": "4000000.00",
    "status": "PAID",
    "items": []
  }
}
items pada contoh disederhanakan. Respons aktual berisi rincian item yang tersimpan pada pesanan.

Kemungkinan status respons
- 200 OK: detail pesanan ditemukan.
- 404 Not Found: pesanan tidak ditemukan atau ID tidak valid.
9.4 Melihat Daftar Pesanan Pengguna
Request
GET /orders/user/{userId}
Contoh:
GET /orders/user/1
Menampilkan seluruh pesanan milik pengguna berdasarkan ID pengguna.

Respons berhasil — 200 OK
{
  "message": "Daftar pesanan berhasil diambil.",
  "data": []
}
Array data berisi daftar pesanan milik pengguna, termasuk rincian item masing-masing pesanan. Array kosong berarti belum ada pesanan yang cocok.

Endpoint ini mendukung filter status.

Contoh pesanan yang masih menunggu pembayaran:
GET /orders/user/1?status=PENDING
Contoh pesanan yang sudah dibayar:
GET /orders/user/1?status=PAID
Kemungkinan status respons
- 200 OK: daftar pesanan berhasil diambil.
- 422 Unprocessable Entity: nilai status tidak sesuai ketentuan.
Nilai status yang diterima hanya PENDING dan PAID.
9.5 Mengubah Status Pembayaran
Request
PATCH /orders/{id}/pay
Contoh:
PATCH /orders/3/pay
Mengubah status pesanan dari PENDING menjadi PAID.

Respons berhasil — 200 OK
{
  "message": "Pembayaran berhasil.",
  "data": {
    "id": 3,
    "user_id": "1",
    "total_amount": "4000000.00",
    "status": "PAID",
    "items": []
  }
}
Kemungkinan status respons
- 200 OK: status berhasil diubah menjadi PAID.
- 404 Not Found: pesanan tidak ditemukan atau ID tidak valid.
- 409 Conflict: pesanan tidak berstatus PENDING, misalnya sudah PAID.
- 500 Internal Server Error: terjadi kesalahan internal.
Contoh respons ketika pembayaran dilakukan kembali:
{
  "message": "Pesanan hanya bisa dibayar jika statusnya PENDING."
}
10. Validasi dan Penanganan Kesalahan
Order Service menerapkan validasi pada request dan proses bisnis checkout.

Kondisi yang ditangani meliputi:
- user_id tidak diberikan, bukan bilangan bulat, atau kurang dari satu.
- Keranjang pengguna kosong.
- Data item keranjang tidak valid.
- Produk tidak ditemukan pada Product Service.
- Jumlah pembelian melebihi stok produk.
- Cart Service tidak dapat dihubungi atau mengembalikan respons yang tidak berhasil.
- Product Service tidak dapat dihubungi atau mengembalikan respons yang tidak berhasil.
- Pesanan tidak ditemukan.
- Status pesanan tidak memungkinkan untuk dibayar kembali.
- Terjadi kesalahan internal ketika memproses pesanan atau pembayaran.
Pemetaan status HTTP utama:
- 200: Request berhasil, misalnya membaca pesanan atau membayar pesanan
- 201: Pesanan berhasil dibuat
- 404: Pesanan atau produk tidak ditemukan sesuai konteks endpoint
- 409: Konflik proses checkout atau pembayaran
- 422: Data request atau filter tidak valid
- 503: Layanan eksternal yang dibutuhkan mengalami gangguan
- 500: Kesalahan internal server
Komunikasi HTTP dengan Cart Service dan Product Service menggunakan batas waktu koneksi dan request maksimal lima detik. Kegagalan koneksi ditangani agar tidak menghentikan aplikasi tanpa respons yang sesuai.
11. Pengujian API
Pengujian endpoint dilakukan menggunakan Insomnia dengan base URL:
http://localhost:3003
Skenario pengujian Order Service:
- No. — 1
  - Skenario: Memeriksa kondisi service
  - Endpoint: GET /health
  - Hasil yang diharapkan: 200 OK
- No. — 2
  - Skenario: Membuat pesanan dengan data valid
  - Endpoint: POST /orders
  - Hasil yang diharapkan: 201 Created
- No. — 3
  - Skenario: Membuat pesanan tanpa user_id
  - Endpoint: POST /orders
  - Hasil yang diharapkan: 422 Unprocessable Entity
- No. — 4
  - Skenario: Checkout dengan keranjang kosong
  - Endpoint: POST /orders
  - Hasil yang diharapkan: 409 Conflict
- No. — 5
  - Skenario: Checkout dengan stok tidak mencukupi
  - Endpoint: POST /orders
  - Hasil yang diharapkan: 409 Conflict
- No. — 6
  - Skenario: Checkout dengan produk tidak ditemukan
  - Endpoint: POST /orders
  - Hasil yang diharapkan: 409 Conflict
- No. — 7
  - Skenario: Product Service tidak tersedia
  - Endpoint: POST /orders
  - Hasil yang diharapkan: 503 Service Unavailable
- No. — 8
  - Skenario: Cart Service tidak tersedia
  - Endpoint: POST /orders
  - Hasil yang diharapkan: 503 Service Unavailable
- No. — 9
  - Skenario: Mengambil detail pesanan yang tersedia
  - Endpoint: GET /orders/{id}
  - Hasil yang diharapkan: 200 OK
- No. — 10
  - Skenario: Mengambil detail pesanan yang tidak tersedia
  - Endpoint: GET /orders/{id}
  - Hasil yang diharapkan: 404 Not Found
- No. — 11
  - Skenario: Mengambil daftar pesanan pengguna
  - Endpoint: GET /orders/user/{userId}
  - Hasil yang diharapkan: 200 OK
- No. — 12
  - Skenario: Memfilter status PENDING atau PAID
  - Endpoint: GET /orders/user/{userId}?status=...
  - Hasil yang diharapkan: 200 OK
- No. — 13
  - Skenario: Mengirim filter status tidak valid
  - Endpoint: GET /orders/user/{userId}?status=...
  - Hasil yang diharapkan: 422 Unprocessable Entity
- No. — 14
  - Skenario: Membayar pesanan berstatus PENDING
  - Endpoint: PATCH /orders/{id}/pay
  - Hasil yang diharapkan: 200 OK
- No. — 15
  - Skenario: Membayar ulang pesanan berstatus PAID
  - Endpoint: PATCH /orders/{id}/pay
  - Hasil yang diharapkan: 409 Conflict
Pengujian snapshot dilakukan dengan membuat pesanan, kemudian mengubah informasi harga produk pada Product Service dan memeriksa kembali detail pesanan. Nilai unit_price pada detail pesanan tetap menggunakan harga ketika pesanan dibuat.

Pengujian kegagalan service dilakukan dengan menghentikan service terkait sementara, mengirim request yang membutuhkan service tersebut, lalu memeriksa respons dan log Order Service.
12. Logging dan Troubleshooting
Order Service mencatat kesalahan yang terjadi ketika proses checkout atau pembayaran gagal. Kegagalan pengosongan keranjang setelah pesanan tersimpan juga dilaporkan melalui mekanisme logging.

Untuk memeriksa log Order Service:
docker compose logs -f order-service
Untuk memeriksa status container:
docker compose ps
Jika Order Service belum dapat diakses, periksa hal-hal berikut:
1. Pastikan Docker Desktop berjalan.
2. Pastikan container database Order Service berstatus healthy.
3. Pastikan Product Service dan Cart Service berjalan.
4. Pastikan port 3003 tidak digunakan aplikasi lain.
5. Periksa log menggunakan docker compose logs -f order-service.
6. Jika perubahan konfigurasi Dockerfile atau source perlu diterapkan ulang, bangun ulang service terkait:
docker compose up --build -d order-service
Jika database belum siap, tunggu health check database dan periksa kembali log service.
13. Keputusan dan Batasan Implementasi
13.1 Keputusan implementasi
- Setiap service memiliki tanggung jawab dan database masing-masing.
- Komunikasi antarservice dilakukan melalui REST API.
- Order Service menggunakan client terpisah untuk Cart Service dan Product Service.
- URL service dikonfigurasi melalui environment variable.
- Data nama dan harga produk disimpan sebagai snapshot pada saat pesanan dibuat.
- Penyimpanan data pesanan dan detail item menggunakan database transaction.
- Status awal pesanan adalah PENDING.
- Pembayaran mengubah status menjadi PAID dan tidak dapat dilakukan dua kali.
- Kegagalan pengosongan keranjang setelah pesanan tersimpan dicatat dan tidak membatalkan pesanan.
13.2 Batasan implementasi
Fitur berikut belum termasuk dalam cakupan implementasi:
- Autentikasi dan otorisasi pengguna.
- Integrasi payment gateway atau pemrosesan pembayaran sungguhan.
- Pengurangan stok produk secara otomatis.
- Pembatalan pesanan.
- Frontend aplikasi.
- API Gateway dan message broker.
Status PAID pada proyek ini merupakan perubahan status internal untuk kebutuhan simulasi, bukan bukti transaksi pembayaran melalui penyedia pembayaran sungguhan.
14. Pengembangan Selanjutnya
Pengembangan berikutnya dapat mencakup pembuatan frontend agar pengguna dapat melihat produk, mengelola keranjang, membuat pesanan, dan melihat status pesanan melalui antarmuka aplikasi.

Pengembangan autentikasi, integrasi payment gateway, pengelolaan stok, dan pembatalan pesanan juga dapat dipertimbangkan sebagai pengembangan lanjutan di luar cakupan implementasi saat ini.
15. Penutup
Proyek ini menerapkan pendekatan microservices dengan membagi fungsi e-commerce ke dalam Product Service, Cart Service, Review Service, dan Order Service. Order Service mengintegrasikan Cart Service dan Product Service dalam proses checkout serta mengelola data pesanan secara mandiri.

Melalui pemisahan tanggung jawab, komunikasi REST API, validasi request, database transaction, snapshot produk, dan penanganan kesalahan, proses pengelolaan pesanan dapat dilakukan secara lebih terstruktur.

Dokumentasi ini menjelaskan arsitektur, konfigurasi, cara menjalankan proyek, endpoint API, serta skenario pengujian sebagai panduan penggunaan dan pengembangan repository.