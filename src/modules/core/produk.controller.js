// =============================================
// TODO: ADIT - Implementasi Produk Controller
// =============================================
// Endpoint yang perlu dibuat:
// 1. POST   /produk      - Tambah produk panen baru
// 2. GET    /produk      - List produk (filter: kategori, search)
// 3. PUT    /produk/:id  - Update produk (harga, stok, dll)
// 4. DELETE /produk/:id  - Hapus produk
//
// Database: MySQL (tabel produk_panen) + Firestore (collection realtime_stok)
// Setiap create/update/delete produk, JUGA update di Firestore realtime_stok
// =============================================

const db = require('../../config/mysql');
const firestore = require('../../config/firestore');

// TODO ADIT: Implementasi create produk
exports.create = async (req, res, next) => {
  res.status(501).json({ success: false, message: 'TODO: Adit - implementasi create produk' });
};

// TODO ADIT: Implementasi get all produk
exports.getAll = async (req, res, next) => {
  res.status(501).json({ success: false, message: 'TODO: Adit - implementasi getAll produk' });
};

// TODO ADIT: Implementasi update produk
exports.update = async (req, res, next) => {
  res.status(501).json({ success: false, message: 'TODO: Adit - implementasi update produk' });
};

// TODO ADIT: Implementasi delete produk
exports.remove = async (req, res, next) => {
  res.status(501).json({ success: false, message: 'TODO: Adit - implementasi delete produk' });
};
