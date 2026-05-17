const db = require('../../config/mysql');

// GET /petani
exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.id,
        p.user_id,
        p.nama_usaha,
        p.lokasi,
        p.luas_lahan,
        p.jenis_tanaman,
        p.rating,
        p.created_at,
        u.nama,
        u.email,
        u.phone,
        u.alamat
      FROM petani p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// GET /petani/:id
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        p.id,
        p.user_id,
        p.nama_usaha,
        p.lokasi,
        p.luas_lahan,
        p.jenis_tanaman,
        p.rating,
        p.created_at,
        u.nama,
        u.email,
        u.phone,
        u.alamat
      FROM petani p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
      `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Petani tidak ditemukan' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};
