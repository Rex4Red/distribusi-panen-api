const db = require('../../config/mysql');
const firestore = require('../../config/firestore');

// =============================================
// PUTRA - Pembayaran Controller
// =============================================

// POST /pembayaran
exports.create = async (req, res, next) => {
  try {
    const { transaksi_id, metode, jumlah } = req.body;

    // Validasi input
    if (!transaksi_id || !metode || !jumlah) {
      return res.status(400).json({
        success: false,
        message: 'transaksi_id, metode, dan jumlah wajib diisi',
      });
    }

    // Validasi metode pembayaran
    const allowedMetode = ['transfer', 'cod', 'e-wallet'];
    if (!allowedMetode.includes(metode)) {
      return res.status(400).json({
        success: false,
        message: `Metode tidak valid. Gunakan: ${allowedMetode.join(', ')}`,
      });
    }

    // Cek transaksi ada
    const [transaksi] = await db.query('SELECT * FROM transaksi WHERE id = ?', [transaksi_id]);
    if (transaksi.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
    }

    // Cek apakah sudah ada pembayaran untuk transaksi ini
    const [existingPayment] = await db.query('SELECT id FROM pembayaran WHERE transaksi_id = ?', [transaksi_id]);
    if (existingPayment.length > 0) {
      return res.status(400).json({ success: false, message: 'Pembayaran untuk transaksi ini sudah ada' });
    }

    // Simpan pembayaran ke MySQL
    const [result] = await db.query(
      'INSERT INTO pembayaran (transaksi_id, metode, jumlah, status) VALUES (?, ?, ?, ?)',
      [transaksi_id, metode, jumlah, 'berhasil']
    );

    // Log activity di Firestore
    await firestore.collection('activity_logs').add({
      user_id: req.user.id,
      action: 'create_pembayaran',
      detail: {
        pembayaran_id: result.insertId,
        transaksi_id,
        metode,
        jumlah,
      },
      timestamp: new Date(),
    });

    // Kirim notifikasi
    await firestore.collection('notifikasi').add({
      user_id: transaksi[0].petani_id,
      judul: 'Pembayaran Baru',
      pesan: `Pembayaran sebesar Rp ${jumlah.toLocaleString()} untuk transaksi #${transaksi_id}`,
      tipe: 'pembayaran_baru',
      is_read: false,
      created_at: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Pembayaran berhasil dibuat',
      data: { id: result.insertId, transaksi_id, metode, jumlah, status: 'berhasil' },
    });
  } catch (error) {
    next(error);
  }
};

// GET /pembayaran/:id
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT py.*, t.jumlah_kg, t.total_harga, t.status as status_transaksi,
             pp.nama_produk, u_petani.nama as nama_petani, u_pembeli.nama as nama_pembeli
      FROM pembayaran py
      JOIN transaksi t ON py.transaksi_id = t.id
      JOIN produk_panen pp ON t.produk_id = pp.id
      JOIN petani p ON t.petani_id = p.id
      JOIN users u_petani ON p.user_id = u_petani.id
      JOIN pembeli pb ON t.pembeli_id = pb.id
      JOIN users u_pembeli ON pb.user_id = u_pembeli.id
      WHERE py.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pembayaran tidak ditemukan' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};
