// =============================================
// TODO: ADIT - Implementasi Auth Module
// =============================================
// Endpoint yang perlu dibuat:
// 1. POST /auth/register - Register user baru (petani/pembeli/admin)
// 2. POST /auth/login    - Login, return JWT token
// 3. GET  /auth/profile  - Get user profile
// 4. PUT  /auth/profile  - Update user profile
//
// Gunakan: bcryptjs untuk hash password, jsonwebtoken untuk JWT
// Database: MySQL (tabel users, petani, pembeli)
// =============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/mysql');

// TODO ADIT: Implementasi register
exports.register = async (req, res, next) => {
  res.status(501).json({ success: false, message: 'TODO: Adit - implementasi register' });
};

// TODO ADIT: Implementasi login
exports.login = async (req, res, next) => {
  res.status(501).json({ success: false, message: 'TODO: Adit - implementasi login' });
};

// TODO ADIT: Implementasi get profile
exports.getProfile = async (req, res, next) => {
  res.status(501).json({ success: false, message: 'TODO: Adit - implementasi getProfile' });
};

// TODO ADIT: Implementasi update profile
exports.updateProfile = async (req, res, next) => {
  res.status(501).json({ success: false, message: 'TODO: Adit - implementasi updateProfile' });
};
