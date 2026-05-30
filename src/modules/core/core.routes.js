const express = require('express');
const router = express.Router();
const petaniController = require('./petani.controller');
const produkController = require('./produk.controller');
const transaksiController = require('./transaksi.controller');
const pembayaranController = require('./pembayaran.controller');
const chatController = require('./chat.controller');
const authMiddleware = require('../../middleware/auth');
const upload = require('../../middleware/upload');

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
router.post('/produk', upload.array('foto', 3), produkController.create);  // Upload max 3 foto
router.get('/produk', produkController.getAll);
router.get('/produk/:id', produkController.getById);
router.get('/produk/:id/foto', produkController.getFoto);           // Ambil foto dari Firestore
router.put('/produk/:id', produkController.update);
router.put('/produk/:id/verify', produkController.verify);          // Admin approve/reject
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
router.delete('/transaksi/:id', transaksiController.remove);

// =============================================
// PUTRA: Pembayaran routes
// =============================================
router.post('/pembayaran', pembayaranController.create);
router.get('/pembayaran/:id', pembayaranController.getById);

// =============================================
// Chat Negosiasi Harga (Firestore)
// =============================================
router.get('/chat/rooms', chatController.getRooms);
router.post('/chat/rooms', chatController.createRoom);
router.get('/chat/rooms/:roomId', chatController.getRoom);
router.get('/chat/rooms/:roomId/messages', chatController.getMessages);
router.post('/chat/rooms/:roomId/messages', chatController.sendMessage);
router.put('/chat/rooms/:roomId/accept-price', chatController.acceptPrice);

module.exports = router;
