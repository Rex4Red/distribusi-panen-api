const db = require('../../config/mysql');
const firestore = require('../../config/firestore');

// =============================================
// TODO: ADIT - Implementasi create & getAll transaksi
// =============================================

// TODO ADIT: POST /transaksi - Buat transaksi baru
exports.create = async (req, res, next) => {
  res.status(501).json({ success: false, message: 'TODO: Adit - implementasi create transaksi' });
};

// TODO ADIT: GET /transaksi - List semua transaksi
exports.getAll = async (req, res, next) => {
  res.status(501).json({ success: false, message: 'TODO: Adit - implementasi getAll transaksi' });
};

// =============================================
// PUTRA - Transaksi Detail & Update Status
// =============================================

// GET /transaksi/:id
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, pp.nama_produk, u_petani.nama as nama_petani, u_pembeli.nama as nama_pembeli
      FROM transaksi t
      JOIN produk_panen pp ON t.produk_id = pp.id
      JOIN petani p ON t.petani_id = p.id
      JOIN users u_petani ON p.user_id = u_petani.id
      JOIN pembeli pb ON t.pembeli_id = pb.id
      JOIN users u_pembeli ON pb.user_id = u_pembeli.id
      WHERE t.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

// PUT /transaksi/:id
exports.update = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Validasi status yang diperbolehkan
    const allowedStatus = ['pending', 'dikonfirmasi', 'dikirim', 'selesai', 'dibatalkan'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Gunakan: ${allowedStatus.join(', ')}`,
      });
    }

    // Update di MySQL
    const [result] = await db.query('UPDATE transaksi SET status = ? WHERE id = ?', [status, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
    }

    // Log activity di Firestore
    await firestore.collection('activity_logs').add({
      user_id: req.user.id,
      action: 'update_status_transaksi',
      detail: {
        transaksi_id: parseInt(req.params.id),
        new_status: status,
      },
      timestamp: new Date(),
    });

    // Kirim notifikasi ke pihak terkait
    const [transaksi] = await db.query('SELECT * FROM transaksi WHERE id = ?', [req.params.id]);
    if (transaksi.length > 0) {
      await firestore.collection('notifikasi').add({
        user_id: transaksi[0].petani_id,
        judul: 'Update Transaksi',
        pesan: `Transaksi #${req.params.id} status diubah ke: ${status}`,
        tipe: 'update_transaksi',
        is_read: false,
        created_at: new Date(),
      });
    }

    res.json({ success: true, message: `Status transaksi berhasil diubah ke: ${status}` });
  } catch (error) {
    next(error);
  }
};
