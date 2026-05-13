const db = require('../../config/mysql');
const firestore = require('../../config/firestore');

// POST /pengiriman
exports.create = async (req, res, next) => {
  try {
    const { transaksi_id, alamat_asal, alamat_tujuan, kurir, estimasi } = req.body;

    const [result] = await db.query(
      'INSERT INTO pengiriman (transaksi_id, alamat_asal, alamat_tujuan, kurir, estimasi, status) VALUES (?, ?, ?, ?, ?, ?)',
      [transaksi_id, alamat_asal, alamat_tujuan, kurir, estimasi, 'diproses']
    );

    // Simpan status logistik ke Firestore untuk tracking realtime
    await firestore.collection('status_logistik').doc(`pengiriman_${result.insertId}`).set({
      pengiriman_id: result.insertId,
      transaksi_id,
      status: 'diproses',
      kurir,
      alamat_asal,
      alamat_tujuan,
      lokasi: null,
      updated_at: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Pengiriman berhasil dibuat',
      data: { id: result.insertId, status: 'diproses' },
    });
  } catch (error) {
    next(error);
  }
};

// GET /pengiriman/:id
exports.getById = async (req, res, next) => {
  try {
    // Ambil data dari MySQL
    const [rows] = await db.query(`
      SELECT pg.*, t.jumlah_kg, t.total_harga, pp.nama_produk
      FROM pengiriman pg
      JOIN transaksi t ON pg.transaksi_id = t.id
      JOIN produk_panen pp ON t.produk_id = pp.id
      WHERE pg.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengiriman tidak ditemukan' });
    }

    // Ambil status realtime dari Firestore
    const firestoreDoc = await firestore.collection('status_logistik').doc(`pengiriman_${req.params.id}`).get();
    const realtimeStatus = firestoreDoc.exists ? firestoreDoc.data() : null;

    res.json({
      success: true,
      data: { ...rows[0], realtime: realtimeStatus },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /pengiriman/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, lokasi_lat, lokasi_lng } = req.body;

    // Update di MySQL
    await db.query('UPDATE pengiriman SET status = ? WHERE id = ?', [status, req.params.id]);

    // Update realtime di Firestore
    await firestore.collection('status_logistik').doc(`pengiriman_${req.params.id}`).set({
      status,
      lokasi: lokasi_lat && lokasi_lng ? { lat: lokasi_lat, lng: lokasi_lng } : null,
      updated_at: new Date(),
    }, { merge: true });

    // Log activity
    await firestore.collection('activity_logs').add({
      user_id: req.user.id,
      action: 'update_pengiriman_status',
      detail: { pengiriman_id: parseInt(req.params.id), new_status: status },
      timestamp: new Date(),
    });

    res.json({ success: true, message: 'Status pengiriman berhasil diupdate' });
  } catch (error) {
    next(error);
  }
};
