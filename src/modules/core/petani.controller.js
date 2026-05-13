// =============================================
// TODO: ADIT - Implementasi Petani Controller
// =============================================
// Endpoint yang perlu dibuat:
// 1. GET /petani      - List semua petani (JOIN users)
// 2. GET /petani/:id  - Detail petani by ID
//
// Database: MySQL (tabel petani + users)
// =============================================

const db = require('../../config/mysql');

// TODO ADIT: Implementasi get all petani
exports.getAll = async (req, res, next) => {
  res.status(501).json({ success: false, message: 'TODO: Adit - implementasi getAll petani' });
};

// TODO ADIT: Implementasi get petani by ID
exports.getById = async (req, res, next) => {
  res.status(501).json({ success: false, message: 'TODO: Adit - implementasi getById petani' });
};
