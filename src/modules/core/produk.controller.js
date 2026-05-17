const db = require('../../config/mysql');
const firestore = require('../../config/firestore');

// =============================================
// ADIT - Produk Controller
// =============================================

const allowedStatus = ['tersedia', 'habis', 'nonaktif'];
const stokCollection = firestore.collection('realtime_stok');

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const buildRealtimeStok = (produk) => ({
  produk_id: produk.id,
  petani_id: produk.petani_id,
  nama_produk: produk.nama_produk,
  kategori: produk.kategori,
  harga_per_kg: Number(produk.harga_per_kg),
  stok_kg: Number(produk.stok_kg),
  status: produk.status,
  updated_at: new Date(),
});

// POST /produk
exports.create = async (req, res, next) => {
  try {
    // Ambil data dari request
    const {
      petani_id,
      nama_produk,
      kategori = null,
      harga_per_kg,
      stok_kg,
      deskripsi = null,
      foto_url = null,
      status = 'tersedia',
    } = req.body;

    // Konversi harga dan stok ke number
    const harga = toNumber(harga_per_kg);
    const stok = toNumber(stok_kg);

    // Validasi input
    if (!petani_id || !nama_produk || harga === null || stok === null) {
      return res.status(400).json({
        success: false,
        message: 'petani_id, nama_produk, harga_per_kg, dan stok_kg wajib diisi',
      });
    }

    // Validasi harga dan stok
    if (harga < 0 || stok < 0) {
      return res.status(400).json({ success: false, message: 'harga_per_kg dan stok_kg tidak boleh negatif' });
    }

    // Validasi status
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Gunakan: ${allowedStatus.join(', ')}`,
      });
    }

    // Cek petani ada
    const [petani] = await db.query('SELECT id FROM petani WHERE id = ?', [petani_id]);
    if (petani.length === 0) {
      return res.status(404).json({ success: false, message: 'Petani tidak ditemukan' });
    }

    // Simpan produk ke MySQL
    const [result] = await db.query(
      `INSERT INTO produk_panen
       (petani_id, nama_produk, kategori, harga_per_kg, stok_kg, deskripsi, foto_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [petani_id, nama_produk, kategori, harga, stok, deskripsi, foto_url, status]
    );

    // Menyimpan data produk ke Firestore
    const data = {
      id: result.insertId,
      petani_id,
      nama_produk,
      kategori,
      harga_per_kg: harga,
      stok_kg: stok,
      deskripsi,
      foto_url,
      status,
    };

    await stokCollection.doc(String(result.insertId)).set(buildRealtimeStok(data));

    res.status(201).json({
      success: true,
      message: 'Produk berhasil dibuat',
      data,
    });
  } catch (error) {
    next(error);
  }
};

// GET /produk
exports.getAll = async (req, res, next) => {
  try {
    const { kategori, search } = req.query;
    const where = [];
    const params = [];

    // Validasi kategori
    if (kategori) {
      where.push('pp.kategori = ?');
      params.push(kategori);
    }

    if (search) {
      where.push('(pp.nama_produk LIKE ? OR pp.deskripsi LIKE ?)');
      const keyword = `%${search}%`;
      params.push(keyword, keyword);
    }

    // Ambil produk dari MySQL
    const [rows] = await db.query(
      `
      SELECT pp.*, p.nama_usaha, p.lokasi, u.nama AS nama_petani
      FROM produk_panen pp
      JOIN petani p ON pp.petani_id = p.id
      JOIN users u ON p.user_id = u.id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY pp.created_at DESC
      `,
      params
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// PUT /produk/:id
exports.update = async (req, res, next) => {
  try {
    const allowedFields = ['nama_produk', 'kategori', 'harga_per_kg', 'stok_kg', 'deskripsi', 'foto_url', 'status'];
    const updates = [];
    const params = [];

    // Validasi input
    for (const field of allowedFields) {
      if (req.body[field] === undefined) continue;

      if (field === 'harga_per_kg' || field === 'stok_kg') {
        const number = toNumber(req.body[field]);
        if (number === null || number < 0) {
          return res.status(400).json({ success: false, message: `${field} harus berupa angka dan tidak boleh negatif` });
        }
        updates.push(`${field} = ?`);
        params.push(number);
        continue;
      }

      // Validasi status
      if (field === 'status' && !allowedStatus.includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          message: `Status tidak valid. Gunakan: ${allowedStatus.join(', ')}`,
        });
      }

      updates.push(`${field} = ?`);
      params.push(req.body[field]);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data yang diupdate' });
    }

    // Update di MySQL
    params.push(req.params.id);
    const [result] = await db.query(`UPDATE produk_panen SET ${updates.join(', ')} WHERE id = ?`, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    const [rows] = await db.query('SELECT * FROM produk_panen WHERE id = ?', [req.params.id]);
    const data = rows[0];

    // Menyimpan data produk ke Firestore
    await stokCollection.doc(String(req.params.id)).set(buildRealtimeStok(data), { merge: true });

    res.json({
      success: true,
      message: 'Produk berhasil diupdate',
      data,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /produk/:id
exports.remove = async (req, res, next) => {
  try {
    // Hapus di MySQL
    const [result] = await db.query('DELETE FROM produk_panen WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    // Hapus di Firestore
    await stokCollection.doc(String(req.params.id)).delete();

    res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};
