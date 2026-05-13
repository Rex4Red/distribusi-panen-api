const express = require('express');
const router = express.Router();
const pengirimanController = require('./pengiriman.controller');
const stokRealtimeController = require('./stok-realtime.controller');
const logistikController = require('./logistik.controller');
const authMiddleware = require('../../middleware/auth');

// Semua route perlu login
router.use(authMiddleware);

// Pengiriman routes
router.post('/pengiriman', pengirimanController.create);
router.get('/pengiriman/:id', pengirimanController.getById);
router.put('/pengiriman/:id/status', pengirimanController.updateStatus);

// Stok Realtime routes (Firestore)
router.get('/stok-realtime', stokRealtimeController.getAll);
router.put('/stok-realtime/:id', stokRealtimeController.update);

// Logistik dashboard
router.get('/logistik/status', logistikController.getDashboard);
router.get('/notifikasi', logistikController.getNotifikasi);

module.exports = router;
