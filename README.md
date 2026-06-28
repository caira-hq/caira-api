# Caira API 🚀

Backend API untuk **Caira** — platform invoicing berbasis blockchain Stellar. Merchant dapat membuat invoice dan menerima pembayaran dalam **XLM (Stellar Lumens)** secara terverifikasi on-chain.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Runtime | Node.js (CommonJS) |
| Framework | Express 5 |
| Database | PostgreSQL + Prisma ORM |
| Blockchain | Stellar Network (via `@stellar/stellar-sdk`) |
| Auth | JWT + Stellar Wallet Signature |
| Security | Global API Key, Helmet, CORS, Rate Limiting |

---

## Arsitektur

```
src/
├── config/
│   ├── db.js          # Prisma client + PostgreSQL adapter
│   ├── env.js         # Validasi environment variable saat startup
│   ├── jwt.js         # Helper sign & verify JWT
│   └── stellar.js     # Konfigurasi Horizon server (testnet/mainnet)
├── controllers/
│   ├── authController.js
│   ├── invoiceController.js
│   ├── withdrawController.js
│   └── userController.js
├── middlewares/
│   ├── apiKeyAuth.js    # Global API Key protection
│   ├── authenticate.js  # Guard JWT — proteksi route
│   ├── errorHandler.js  # Global error handler + AppError class
│   ├── rateLimiter.js   # Rate limiting (global & strict)
│   └── validate.js      # Validasi request body
├── routes/
│   ├── authRoutes.js
│   ├── invoiceRoutes.js
│   ├── withdrawRoutes.js
│   └── userRoutes.js
├── services/
│   ├── anchorService.js   # Mock service untuk Fiat Off-Ramp / E-Wallet
│   ├── authService.js     # Logic challenge, signature, JWT
│   ├── invoiceService.js  # Logic CRUD invoice
│   ├── stellarService.js  # Pengecekan transaksi di blockchain
│   └── userService.js     # Logic registrasi user
├── utils/
│   ├── logger.js    # Logger sederhana dengan timestamp
│   └── response.js  # Format response API yang konsisten
└── index.js         # Entry point — setup Express & middleware
```

---

## Prasyarat

- Node.js v18+
- PostgreSQL running di lokal
- Git

---

## Instalasi & Setup

### 1. Clone dan install dependency

```bash
git clone https://github.com/caira-hq/caira-api.git
cd caira-api
npm install
```

### 2. Konfigurasi environment

```bash
cp .env.example .env
```

Lalu edit `.env` dan sesuaikan nilainya:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/caira_db"

# Server
PORT=5000
NODE_ENV=development

# Kunci Rahasia Global (Wajib untuk semua request dari Frontend)
CAIRA_API_KEY="caira_hackathon_super_secret_2026"

# CORS — URL frontend yang diizinkan
ALLOWED_ORIGIN=http://localhost:3000

# JWT — generate dengan: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=isi_dengan_string_acak_minimal_32_karakter
JWT_EXPIRES_IN=7d

# Stellar Network: testnet | mainnet
STELLAR_NETWORK=testnet

# Log level: error | warn | info
LOG_LEVEL=info
```

> ⚠️ **Jangan commit file `.env`** — sudah di-ignore oleh `.gitignore`.

### 3. Setup database

```bash
npx prisma migrate dev   # jalankan migrasi
npx prisma generate      # generate Prisma client
```

### 4. Jalankan server

```bash
npm run dev    # development (auto-restart dengan nodemon)
npm run start  # production
```

Server berjalan di: `http://localhost:5000`

---

## Auth Flow

Caira menggunakan autentikasi berbasis **Stellar wallet signature** — tanpa password. Alurnya:

```
1. POST /api/auth/challenge  →  server kirim pesan challenge
2. Client menandatangani pesan dengan Stellar private key
3. POST /api/auth/verify     →  server verifikasi signature → JWT token
4. Gunakan JWT di header: Authorization: Bearer <token>
```

### Testing auth dari terminal

```bash
# Generate keypair baru + auto register + auto login (paling mudah)
node sign-challenge.js

# Hanya generate keypair baru
node sign-challenge.js --keypair

# Login dengan keypair yang sudah ada
node sign-challenge.js <SECRET_KEY>
```

---

## API Reference

**Base URL:** `http://localhost:5000`

> 🔑 **PENTING:** Semua endpoint (publik maupun privat) **WAJIB** menyertakan header `x-api-key: <CAIRA_API_KEY>`.  
> 🔒 = Membutuhkan header tambahan `Authorization: Bearer <token>`

---

### Health

#### `GET /api/health`

Cek status server.

**Response 200:**
```json
{
  "success": true,
  "message": "Caira API is running.",
  "timestamp": "2026-06-27T10:00:00.000Z"
}
```

---

### Users

#### `POST /api/users`

Mendaftarkan user baru menggunakan Stellar wallet address.

**Body:**

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `stellar_wallet` | string | ✅ | Stellar Ed25519 public key (dimulai `G`) |
| `display_name` | string | ✅ | Nama tampilan, maks 100 karakter |

**Request:**
```json
{
  "stellar_wallet": "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGM8BKEV4SQWNWQRMWBFBY",
  "display_name": "Budi Santoso"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "User berhasil didaftarkan di Caira.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "stellar_wallet": "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGM8BKEV4SQWNWQRMWBFBY",
    "display_name": "Budi Santoso",
    "created_at": "2026-06-27T10:00:00.000Z"
  }
}
```

**Error:**

| Status | Kondisi |
|---|---|
| `400` | Format `stellar_wallet` tidak valid |
| `409` | Wallet sudah terdaftar |

---

### Auth

#### `POST /api/auth/challenge`

Meminta challenge yang harus ditandatangani oleh client. Challenge kedaluwarsa dalam **5 menit**.

**Body:**

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `stellar_wallet` | string | ✅ | Wallet yang sudah terdaftar |

**Request:**
```json
{
  "stellar_wallet": "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGM8BKEV4SQWNWQRMWBFBY"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Caira Authentication\n\nWallet: GCEZ...\nNonce: a3f2b1c4...\n\nTandatangani pesan ini untuk masuk ke Caira."
  }
}
```

---

#### `POST /api/auth/verify`

Memverifikasi signature dan mengeluarkan JWT token.

**Body:**

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `stellar_wallet` | string | ✅ | Sama dengan yang dipakai di `/challenge` |
| `signature` | string | ✅ | Hasil signing challenge dalam format Base64 |

**Request:**
```json
{
  "stellar_wallet": "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGM8BKEV4SQWNWQRMWBFBY",
  "signature": "base64EncodedSignatureHere=="
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "display_name": "Budi Santoso",
      "stellar_wallet": "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGM8BKEV4SQWNWQRMWBFBY"
    }
  }
}
```

**Error:**

| Status | Kondisi |
|---|---|
| `401` | Signature tidak valid |
| `401` | Challenge tidak ditemukan atau sudah kedaluwarsa |

---

### Invoices

#### `POST /api/invoices` 🔒

Membuat invoice baru. User ID diambil otomatis dari JWT token.

**Body:**

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `client_name` | string | ✅ | Nama klien, maks 150 karakter |
| `client_email` | string | ✅ | Email klien yang valid |
| `description` | string | ❌ | Deskripsi pekerjaan, maks 500 karakter |
| `amount_xlm` | number | ✅ | Jumlah tagihan dalam XLM, harus > 0 |

**Request:**
```json
{
  "client_name": "PT Maju Jaya",
  "client_email": "finance@majujaya.com",
  "description": "Jasa desain website Q2 2026",
  "amount_xlm": 150.5
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Invoice berhasil dibuat.",
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "invoice_code": "INV-1719480000000-A3F2B1C4",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "client_name": "PT Maju Jaya",
    "client_email": "finance@majujaya.com",
    "description": "Jasa desain website Q2 2026",
    "amount_xlm": "150.5",
    "status": "PENDING",
    "created_at": "2026-06-27T10:00:00.000Z"
  }
}
```

---

#### `GET /api/invoices/:invoice_code`

Melihat detail invoice. **Publik** — tidak butuh token, agar klien bisa melihat jumlah dan wallet tujuan pembayaran.

**Param URL:**

| Param | Keterangan |
|---|---|
| `invoice_code` | Kode invoice (contoh: `INV-1719480000000-A3F2B1C4`) |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "invoice_code": "INV-1719480000000-A3F2B1C4",
    "client_name": "PT Maju Jaya",
    "client_email": "finance@majujaya.com",
    "description": "Jasa desain website Q2 2026",
    "amount_xlm": "150.5",
    "status": "PENDING",
    "created_at": "2026-06-27T10:00:00.000Z",
    "user": {
      "display_name": "Budi Santoso",
      "stellar_wallet": "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGM8BKEV4SQWNWQRMWBFBY"
    }
  }
}
```

**Error:**

| Status | Kondisi |
|---|---|
| `404` | Invoice tidak ditemukan |

---

#### `POST /api/invoices/:invoice_code/verify` 🔒

Memverifikasi pembayaran di jaringan Stellar. **Hanya pemilik invoice** yang bisa memanggil endpoint ini.

Server mengecek 20 transaksi terakhir di wallet merchant dan mencocokkan memo transaksi dengan `invoice_code`. Jika cocok, status invoice otomatis diubah menjadi `PAID`.

**Param URL:**

| Param | Keterangan |
|---|---|
| `invoice_code` | Kode invoice yang ingin diverifikasi |

> Tidak ada request body.

**Response 200 — Berhasil diverifikasi:**
```json
{
  "success": true,
  "message": "Pembayaran berhasil diverifikasi di jaringan Stellar. Tagihan lunas.",
  "invoice": { "status": "PAID" }
}
```

**Response 200 — Belum dibayar:**
```json
{
  "success": false,
  "message": "Pembayaran belum terdeteksi di jaringan Stellar."
}
```

**Error:**

| Status | Kondisi |
|---|---|
| `403` | Bukan pemilik invoice |
| `404` | Invoice tidak ditemukan |

---

### Cara Klien Bayar Invoice

1. Klien buka `GET /api/invoices/:invoice_code` dan lihat detail invoice.
2. Klien transfer XLM ke `data.user.stellar_wallet` (wallet merchant).
3. **Wajib** isi memo dengan nilai `data.invoice_code` saat melakukan transfer.
4. Merchant panggil `POST /api/invoices/:invoice_code/verify` untuk konfirmasi otomatis.

---

## Testing dengan Postman

Import file koleksi yang sudah tersedia:

```
postman/caira-api.postman_collection.json
```

**Fitur otomatis dalam koleksi:**

- Pastikan memasukkan `x-api-key` di tab **Headers** secara global agar semua endpoint bisa diakses.
- Setelah **Verify & Login** sukses → `{{token}}` tersimpan otomatis.
- Setelah **Create Invoice** sukses → `{{invoice_code}}` tersimpan otomatis.
- Semua endpoint protected sudah pakai `Bearer {{token}}`.

---

## Keamanan

| Fitur | Keterangan |
|---|---|
| Global API Key | Mencegah akses ke API dari frontend atau bot tidak resmi menggunakan header `x-api-key` |
| Helmet | Menambahkan 11+ HTTP security header |
| CORS | Dibatasi hanya ke origin yang diset di `ALLOWED_ORIGIN` |
| Rate Limiting | 100 req/15 menit (global) · 10 req/menit (endpoint sensitif) |
| Body Size Limit | Maksimal 10KB per request |
| Input Validation | Email, Stellar wallet, tipe data, panjang karakter |
| JWT Auth | Token HS256, kedaluwarsa 7 hari (configurable) |
| Stellar Signature | Login diverifikasi on-chain menggunakan Ed25519 |
| Ownership Check | Verifikasi invoice hanya bisa dilakukan pemilik invoice |
| Error Masking | System error tidak bocor ke client di production |

---

## Format Response

Semua response mengikuti format yang konsisten:

```json
// Success
{
  "success": true,
  "message": "...",
  "data": {}
}

// Error
{
  "success": false,
  "message": "Pesan error yang informatif."
}
```

---

## Environment Variables

| Variable | Wajib | Default | Keterangan |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `CAIRA_API_KEY` | ✅ | — | Kunci rahasia global untuk header `x-api-key` |
| `JWT_SECRET` | ✅ | — | Secret key JWT, min 32 karakter |
| `PORT` | ❌ | `5000` | Port server |
| `NODE_ENV` | ❌ | `development` | Mode environment |
| `ALLOWED_ORIGIN` | ❌ | `http://localhost:3000` | URL frontend untuk CORS |
| `JWT_EXPIRES_IN` | ❌ | `7d` | Durasi token JWT |
| `STELLAR_NETWORK` | ❌ | `testnet` | `testnet` atau `mainnet` |
| `LOG_LEVEL` | ❌ | `info` | `error`, `warn`, atau `info` |

---

## Database Schema

```prisma
model User {
  id             String    @id @default(uuid())
  stellar_wallet String    @unique
  display_name   String
  invoices       Invoice[]
  created_at     DateTime  @default(now())
}

model Invoice {
  id           String   @id @default(uuid())
  invoice_code String   @unique
  user_id      String
  client_name  String
  client_email String
  description  String?
  amount_xlm   Decimal
  status       String   @default("PENDING")  // PENDING | PAID
  created_at   DateTime @default(now())

  user         User     @relation(fields: [user_id], references: [id])
}
```

---

## License

ISC