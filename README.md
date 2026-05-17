# 🌾 Distribusi Panen Petani - REST API

Platform penghubung petani langsung dengan restoran dan tengkulak besar.

## Tech Stack
- **Backend**: Node.js + Express.js
- **SQL Database**: MySQL (Cloud SQL)
- **NoSQL Database**: Google Firestore
- **Auth**: JWT (JSON Web Token)
- **Deploy**: Google Cloud Platform (Cloud Run)

## Struktur Project
```
src/
├── modules/
│   ├── auth/           → Module 1: Autentikasi
│   ├── core/           → Module 2: Core Business (Petani, Produk, Transaksi, Pembayaran)
│   └── logistik/       → Module 3: Logistik & Realtime (Pengiriman, Stok, Notifikasi)
├── config/             → Konfigurasi database
├── middleware/         → Auth & Error handler
├── database/           → SQL schema
└── app.js              → Entry point
```

## Setup & Run
```bash
# 1. Clone repo
git clone https://github.com/Rex4Red/distribusi-panen-api.git
cd distribusi-panen-api

# 2. Install dependencies
npm install

# 3. Copy .env
cp .env.example .env
# Edit .env sesuai konfigurasi

# 4. Setup MySQL database
# Jalankan file src/database/init.sql di MySQL

# 5. Jalankan server
npm run dev
```

## API Endpoints

### Auth (Module 1)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/register` | Register user baru |
| POST | `/auth/login` | Login, dapat JWT token |
| GET | `/auth/profile` | Lihat profile (perlu token) |
| PUT | `/auth/profile` | Update profile (perlu token) |

### Core Business (Module 2)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/petani` | List semua petani |
| GET | `/petani/:id` | Detail petani |
| POST | `/produk` | Tambah produk panen |
| GET | `/produk` | List produk (filter: kategori, search) |
| PUT | `/produk/:id` | Update produk |
| DELETE | `/produk/:id` | Hapus produk |
| POST | `/transaksi` | Buat transaksi |
| GET | `/transaksi` | List transaksi |
| GET | `/transaksi/:id` | Detail transaksi |
| PUT | `/transaksi/:id` | Update status transaksi |
| POST | `/pembayaran` | Buat pembayaran |
| GET | `/pembayaran/:id` | Detail pembayaran |

### Logistik & Realtime (Module 3)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/pengiriman` | Buat pengiriman |
| GET | `/pengiriman/:id` | Detail + tracking |
| PUT | `/pengiriman/:id/status` | Update status pengiriman |
| GET | `/stok-realtime` | Stok realtime (Firestore) |
| PUT | `/stok-realtime/:id` | Update stok realtime |
| GET | `/logistik/status` | Dashboard logistik |
| GET | `/notifikasi` | Notifikasi user |

**Total: 23 Endpoints**
