const db = require('../../config/mysql');
const firestore = require('../../config/firestore');

// GET /logistik/status
exports.getDashboard = async (req, res, next) => {
  try {
    // Ambil data transaksi yang sudah dikirim/selesai dari MySQL (data real)
    const [rows] = await db.query(`
      SELECT t.id as transaksi_id, t.status, t.jumlah_kg, t.total_harga, t.created_at,
             pp.nama_produk,
             u_petani.nama as nama_petani,
             u_pembeli.nama as nama_pembeli,
             pb.nama_bisnis,
             pb.alamat as alamat_tujuan,
             p.alamat as alamat_asal,
             pg.id as pengiriman_id, pg.kurir, pg.estimasi,
             COALESCE(pg.status, 
               CASE t.status 
                 WHEN 'dikirim' THEN 'dalam_perjalanan'
                 WHEN 'selesai' THEN 'terkirim'
                 WHEN 'dikonfirmasi' THEN 'diproses'
                 ELSE 'pending'
               END
             ) as status_pengiriman
      FROM transaksi t
      JOIN produk_panen pp ON t.produk_id = pp.id
      JOIN petani p ON t.petani_id = p.id
      JOIN users u_petani ON p.user_id = u_petani.id
      JOIN pembeli pb ON t.pembeli_id = pb.id
      JOIN users u_pembeli ON pb.user_id = u_pembeli.id
      LEFT JOIN pengiriman pg ON pg.transaksi_id = t.id
      WHERE t.status IN ('dikonfirmasi', 'dikirim', 'selesai')
      ORDER BY t.created_at DESC
    `);

    // Format data untuk frontend
    const data = rows.map((row) => ({
      id: row.pengiriman_id || `txn_${row.transaksi_id}`,
      transaksi_id: row.transaksi_id,
      kurir: row.kurir || '-',
      alamat_tujuan: row.alamat_tujuan || row.nama_bisnis || '-',
      alamat_asal: row.alamat_asal || '-',
      status: row.status_pengiriman,
      nama_produk: row.nama_produk,
      nama_petani: row.nama_petani,
      nama_pembeli: row.nama_pembeli || row.nama_bisnis,
      jumlah_kg: row.jumlah_kg,
      total_harga: row.total_harga,
      created_at: row.created_at,
    }));

    // Hitung summary dari semua transaksi (bukan hanya yang sudah dikirim)
    const [allTransaksi] = await db.query(`
      SELECT status, COUNT(*) as count FROM transaksi 
      WHERE status IN ('dikonfirmasi', 'dikirim', 'selesai')
      GROUP BY status
    `);

    const statusCounts = {};
    allTransaksi.forEach(row => { statusCounts[row.status] = row.count; });

    const summary = {
      total: (statusCounts['dikonfirmasi'] || 0) + (statusCounts['dikirim'] || 0) + (statusCounts['selesai'] || 0),
      diproses: statusCounts['dikonfirmasi'] || 0,
      dalam_perjalanan: statusCounts['dikirim'] || 0,
      terkirim: statusCounts['selesai'] || 0,
    };

    res.json({ success: true, data, summary });
  } catch (error) {
    next(error);
  }
};

// GET /notifikasi
exports.getNotifikasi = async (req, res, next) => {
  try {
    let snapshot;
    try {
      snapshot = await firestore
        .collection('notifikasi')
        .where('user_id', '==', req.user.id)
        .orderBy('created_at', 'desc')
        .limit(20)
        .get();
    } catch (indexError) {
      // Fallback jika composite index belum dibuat
      snapshot = await firestore
        .collection('notifikasi')
        .where('user_id', '==', req.user.id)
        .limit(20)
        .get();
    }

    const data = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
