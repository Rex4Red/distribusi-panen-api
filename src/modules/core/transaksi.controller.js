const db = require('../../config/mysql');
const firestore = require('../../config/firestore');

// =============================================
// ADIT - Transaksi Create & List
// =============================================

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

// POST /transaksi
exports.create = async (req, res, next) => {
  let connection;

  try {
    const { pembeli_id, produk_id, jumlah_kg } = req.body;
    const jumlah = toNumber(jumlah_kg);

    // Validasi input
    if (!pembeli_id || !produk_id || jumlah === null) {
      return res.status(400).json({
        success: false,
        message: 'pembeli_id, produk_id, dan jumlah_kg wajib diisi',
      });
    }

    // Validasi jumlah pembelian
    if (jumlah <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'jumlah_kg harus lebih dari 0' 
      });
    }

    // Membuat koneksi transaction MySQL
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Validasi apakah pembeli tersedia
    const [pembeli] = await connection.query(
      'SELECT id FROM pembeli WHERE id = ?', 
      [pembeli_id]
    );
    
    if (pembeli.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Pembeli tidak ditemukan' 
      });
    }

    // Validasi apakah produk tersedia
    const [produk] = await connection.query(
      'SELECT id, petani_id, nama_produk, harga_per_kg, stok_kg, status FROM produk_panen WHERE id = ? FOR UPDATE',
      [produk_id]
    );

    if (produk.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Produk tidak ditemukan' 
      });
    }

    const selectedProduk = produk[0];
    const stok = Number(selectedProduk.stok_kg);
    const hargaPerKg = Number(selectedProduk.harga_per_kg);

    // Validasi status produk
    if (selectedProduk.status !== 'tersedia') {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Produk tidak tersedia' 
      });
    }

    // Validasi stok produk
    if (stok < jumlah) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Stok produk tidak mencukupi' 
      });
    }
    
    const totalHarga = jumlah * hargaPerKg;
    const sisaStok = stok - jumlah;

    // Menambahkan data transaksi baru
    const [result] = await connection.query(
      `INSERT INTO transaksi
       (pembeli_id, petani_id, produk_id, jumlah_kg, total_harga, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [pembeli_id, selectedProduk.petani_id, produk_id, jumlah, totalHarga, 'pending']
    );

    // Mengurangi stok produk setelah transaksi berhasil
    await connection.query(
      'UPDATE produk_panen SET stok_kg = ?, status = IF(? = 0, "habis", status) WHERE id = ?',
      [sisaStok, sisaStok, produk_id]
    );

    // Menyimpan seluruh perubahan ke database
    await connection.commit();

    // Log activity di Firestore
    await firestore.collection('activity_logs').add({
      user_id: req.user.id,
      action: 'create_transaksi',
      detail: {
        transaksi_id: result.insertId,
        pembeli_id,
        petani_id: selectedProduk.petani_id,
        produk_id,
        jumlah_kg: jumlah,
        total_harga: totalHarga,
      },
      timestamp: new Date(),
    });

    // Kirim notifikasi transaksi ke petani
    await firestore.collection('notifikasi').add({
      user_id: selectedProduk.petani_id,
      judul: 'Transaksi Baru',
      pesan: `Pesanan ${selectedProduk.nama_produk} sebanyak ${jumlah} kg menunggu konfirmasi`,
      tipe: 'transaksi_baru',
      is_read: false,
      created_at: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil dibuat',
      data: {
        id: result.insertId,
        pembeli_id,
        petani_id: selectedProduk.petani_id,
        produk_id,
        jumlah_kg: jumlah,
        total_harga: totalHarga,
        status: 'pending',
      },
    });
  } catch (error) {
    // Membatalkan seluruh perubahan jika terjadi kesalahan
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

// GET /transaksi
exports.getAll = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = '';
    let params = [];

    // Filter transaksi berdasarkan role user yang login
    if (userRole === 'petani') {
      whereClause = 'WHERE p.user_id = ?';
      params = [userId];
    } else if (userRole === 'pembeli') {
      whereClause = 'WHERE pb.user_id = ?';
      params = [userId];
    }
    // admin bisa lihat semua (tanpa WHERE)

    const [rows] = await db.query(`
      SELECT t.*, pp.nama_produk, u_petani.nama as nama_petani, u_pembeli.nama as nama_pembeli,
             pay.id AS pembayaran_id, pay.metode, pay.jumlah AS jumlah_pembayaran,
             pay.status AS status_pembayaran, pay.bukti_bayar_url
      FROM transaksi t
      JOIN produk_panen pp ON t.produk_id = pp.id
      JOIN petani p ON t.petani_id = p.id
      JOIN users u_petani ON p.user_id = u_petani.id
      JOIN pembeli pb ON t.pembeli_id = pb.id
      JOIN users u_pembeli ON pb.user_id = u_pembeli.id
      LEFT JOIN pembayaran pay ON t.id = pay.transaksi_id
      ${whereClause}
      ORDER BY t.created_at DESC
    `, params);

    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// =============================================
// PUTRA - Transaksi Detail & Update Status
// =============================================

// GET /transaksi/:id
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, pp.nama_produk, u_petani.nama as nama_petani, u_pembeli.nama as nama_pembeli,
             pay.id AS pembayaran_id, pay.metode, pay.jumlah AS jumlah_pembayaran,
             pay.status AS status_pembayaran, pay.bukti_bayar_url
      FROM transaksi t
      JOIN produk_panen pp ON t.produk_id = pp.id
      JOIN petani p ON t.petani_id = p.id
      JOIN users u_petani ON p.user_id = u_petani.id
      JOIN pembeli pb ON t.pembeli_id = pb.id
      JOIN users u_pembeli ON pb.user_id = u_pembeli.id
      LEFT JOIN pembayaran pay ON t.id = pay.transaksi_id
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

    // Validasi: tidak bisa kirim jika belum dibayar
    if (status === 'dikirim') {
      const [pembayaran] = await db.query('SELECT id FROM pembayaran WHERE transaksi_id = ?', [req.params.id]);
      if (pembayaran.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Tidak bisa mengirim pesanan. Pembeli belum melakukan pembayaran.',
        });
      }
    }

    // Update di MySQL
    const [result] = await db.query('UPDATE transaksi SET status = ? WHERE id = ?', [status, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
    }

    // Auto-update status pembayaran ke 'lunas' saat transaksi dikirim/selesai
    if (status === 'dikirim' || status === 'selesai') {
      await db.query('UPDATE pembayaran SET status = ? WHERE transaksi_id = ?', ['berhasil', req.params.id]);
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

// DELETE /transaksi/:id
exports.remove = async (req, res, next) => {
  try {
    const transaksiId = req.params.id;

    // Hapus pembayaran terkait terlebih dahulu (foreign key)
    await db.query('DELETE FROM pembayaran WHERE transaksi_id = ?', [transaksiId]);

    // Hapus transaksi
    const [result] = await db.query('DELETE FROM transaksi WHERE id = ?', [transaksiId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
    }

    // Log activity di Firestore
    await firestore.collection('activity_logs').add({
      user_id: req.user.id,
      action: 'delete_transaksi',
      detail: {
        transaksi_id: parseInt(transaksiId),
      },
      timestamp: new Date(),
    });

    res.json({ success: true, message: `Transaksi #${transaksiId} berhasil dihapus` });
  } catch (error) {
    next(error);
  }
};
