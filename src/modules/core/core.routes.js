const express = require('express');
const router = express.Router();
const petaniController = require('./petani.controller');
const produkController = require('./produk.controller');
const transaksiController = require('./transaksi.controller');
const pembayaranController = require('./pembayaran.controller');
const authMiddleware = require('../../middleware/auth');

// Semua route di core perlu login
router.use(authMiddleware);

// =============================================
// TODO ADIT: Petani routes
// =============================================
router.get('/petani', petaniController.getAll);
router.get('/petani/:id', petaniController.getById);

// =============================================
// TODO ADIT: Produk routes
// =============================================
router.post('/produk', produkController.create);
router.get('/produk', produkController.getAll);
router.put('/produk/:id', produkController.update);
router.delete('/produk/:id', produkController.remove);

// =============================================
// TODO ADIT: Transaksi create & list
// =============================================
router.post('/transaksi', transaksiController.create);
router.get('/transaksi', transaksiController.getAll);

// =============================================
// PUTRA: Transaksi detail & update
// =============================================
router.get('/transaksi/:id', transaksiController.getById);
router.put('/transaksi/:id', transaksiController.update);

// =============================================
// PUTRA: Pembayaran routes
// =============================================
router.post('/pembayaran', pembayaranController.create);
router.get('/pembayaran/:id', pembayaranController.getById);

module.exports = router;
