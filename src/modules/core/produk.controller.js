const db = require('../../config/mysql');
const firestore = require('../../config/firestore');
const { bucket } = require('../../config/storage');
const path = require('path');

// =============================================
// ADIT - Produk Controller
// =============================================

const allowedStatus = ['menunggu_verifikasi', 'tersedia', 'habis', 'nonaktif', 'ditolak'];
const stokCollection = firestore.collection('realtime_stok');
const fotoCollection = firestore.collection('foto_kualitas');

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

// =============================================
// Helper: Upload foto ke Google Cloud Storage
// =============================================
const uploadToGCS = async (file, produkId) => {
  const ext = path.extname(file.originalname) || '.jpg';
  const fileName = `produk/${produkId}/${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
  const blob = bucket.file(fileName);

  await blob.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
    },
    public: true,
  });

  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
};

// =============================================
// POST /produk — Buat produk baru + upload foto
// =============================================
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
    } = req.body;

    // Status default: menunggu_verifikasi (harus di-approve admin)
    const status = 'menunggu_verifikasi';

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

    // Cek petani ada
    const [petani] = await db.query('SELECT id FROM petani WHERE id = ?', [petani_id]);
    if (petani.length === 0) {
      return res.status(404).json({ success: false, message: 'Petani tidak ditemukan' });
    }

    // Simpan produk ke MySQL (status = menunggu_verifikasi)
    const [result] = await db.query(
      `INSERT INTO produk_panen
       (petani_id, nama_produk, kategori, harga_per_kg, stok_kg, deskripsi, foto_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [petani_id, nama_produk, kategori, harga, stok, deskripsi, foto_url, status]
    );

    const produkId = result.insertId;

    // Upload foto ke GCS jika ada
    const fotoUrls = [];
    console.log('[UPLOAD] req.files:', req.files ? req.files.length : 'null/undefined');
    console.log('[UPLOAD] Bucket name:', bucket.name);
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          console.log('[UPLOAD] Uploading file:', file.originalname, 'size:', file.size, 'mime:', file.mimetype);
          const url = await uploadToGCS(file, produkId);
          console.log('[UPLOAD] Success:', url);
          fotoUrls.push(url);
        } catch (uploadErr) {
          console.error('[UPLOAD] Gagal upload foto:', uploadErr.message);
          console.error('[UPLOAD] Stack:', uploadErr.stack);
        }
      }
    } else {
      console.log('[UPLOAD] Tidak ada file foto yang dikirim');
    }

    // Update foto_url di MySQL agar tersimpan di database
    if (fotoUrls.length > 0) {
      await db.query('UPDATE produk_panen SET foto_url = ? WHERE id = ?', [fotoUrls[0], produkId]);
    }

    // Simpan metadata foto ke Firestore (NoSQL)
    await fotoCollection.doc(String(produkId)).set({
      produk_id: produkId,
      petani_id,
      nama_produk,
      foto_urls: fotoUrls,
      jumlah_foto: fotoUrls.length,
      status_verifikasi: 'menunggu',
      catatan_admin: null,
      submitted_at: new Date(),
      verified_at: null,
    });

    // Simpan realtime stok ke Firestore
    const data = {
      id: produkId,
      petani_id,
      nama_produk,
      kategori,
      harga_per_kg: harga,
      stok_kg: stok,
      deskripsi,
      foto_url: fotoUrls.length > 0 ? fotoUrls[0] : foto_url,
      status,
    };
    await stokCollection.doc(String(produkId)).set(buildRealtimeStok(data));

    // Notifikasi ke admin: produk baru perlu review
    await firestore.collection('notifikasi').add({
      user_id: null, // untuk semua admin
      judul: 'Produk Baru Perlu Review',
      pesan: `Produk "${nama_produk}" dari petani #${petani_id} menunggu verifikasi`,
      tipe: 'verifikasi_produk',
      produk_id: produkId,
      is_read: false,
      created_at: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Produk berhasil disubmit, menunggu verifikasi admin',
      data: { ...data, foto_urls: fotoUrls },
    });
  } catch (error) {
    next(error);
  }
};

// =============================================
// GET /produk — List produk (filtered by role)
// =============================================
exports.getAll = async (req, res, next) => {
  try {
    const { kategori, search, status: filterStatus } = req.query;
    const where = [];
    const params = [];
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // Filter berdasarkan role
    if (userRole === 'pembeli') {
      // Pembeli hanya lihat produk yang sudah disetujui
      where.push("pp.status = 'tersedia'");
    } else if (userRole === 'petani') {
      // Petani hanya lihat produk milik sendiri (semua status)
      const [petaniRow] = await db.query('SELECT id FROM petani WHERE user_id = ?', [userId]);
      if (petaniRow.length > 0) {
        where.push('pp.petani_id = ?');
        params.push(petaniRow[0].id);
      }
    } else if (userRole === 'admin') {
      // Admin bisa filter berdasarkan status
      if (filterStatus) {
        where.push('pp.status = ?');
        params.push(filterStatus);
      }
    }

    // Filter kategori
    if (kategori) {
      where.push('pp.kategori = ?');
      params.push(kategori);
    }

    // Filter search
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

// =============================================
// GET /produk/:id — Detail produk
// =============================================
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `
      SELECT pp.*, p.nama_usaha, p.lokasi, u.nama AS nama_petani
      FROM produk_panen pp
      JOIN petani p ON pp.petani_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE pp.id = ?
      `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

// =============================================
// GET /produk/:id/foto — Ambil foto dari Firestore
// =============================================
exports.getFoto = async (req, res, next) => {
  try {
    const doc = await fotoCollection.doc(String(req.params.id)).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Foto produk tidak ditemukan' });
    }

    res.json({ success: true, data: doc.data() });
  } catch (error) {
    next(error);
  }
};

// =============================================
// PUT /produk/:id/verify — Admin approve/reject
// =============================================
exports.verify = async (req, res, next) => {
  try {
    // Hanya admin yang boleh verifikasi
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Hanya admin yang dapat memverifikasi produk' });
    }

    const { action, catatan } = req.body;

    // Validasi action
    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action harus 'approve' atau 'reject'",
      });
    }

    // Cek produk ada dan statusnya menunggu_verifikasi
    const [rows] = await db.query('SELECT * FROM produk_panen WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    if (rows[0].status !== 'menunggu_verifikasi') {
      return res.status(400).json({
        success: false,
        message: `Produk tidak bisa diverifikasi (status saat ini: ${rows[0].status})`,
      });
    }

    const newStatus = action === 'approve' ? 'tersedia' : 'ditolak';
    const now = new Date();

    // Update di MySQL
    await db.query(
      `UPDATE produk_panen 
       SET status = ?, catatan_admin = ?, verified_at = ?, verified_by = ? 
       WHERE id = ?`,
      [newStatus, catatan || null, now, req.user.id, req.params.id]
    );

    // Update di Firestore foto_kualitas
    await fotoCollection.doc(String(req.params.id)).update({
      status_verifikasi: action === 'approve' ? 'approved' : 'ditolak',
      catatan_admin: catatan || null,
      verified_at: now,
    });

    // Update realtime_stok status
    await stokCollection.doc(String(req.params.id)).update({
      status: newStatus,
      updated_at: now,
    });

    // Notifikasi ke petani
    await firestore.collection('notifikasi').add({
      user_id: rows[0].petani_id,
      judul: action === 'approve' ? 'Produk Disetujui ✅' : 'Produk Ditolak ❌',
      pesan: action === 'approve'
        ? `Produk "${rows[0].nama_produk}" telah disetujui dan tampil di katalog`
        : `Produk "${rows[0].nama_produk}" ditolak. Alasan: ${catatan || '-'}`,
      tipe: 'verifikasi_produk',
      produk_id: rows[0].id,
      is_read: false,
      created_at: now,
    });

    // Log activity
    await firestore.collection('activity_logs').add({
      user_id: req.user.id,
      action: `verify_produk_${action}`,
      detail: {
        produk_id: rows[0].id,
        nama_produk: rows[0].nama_produk,
        catatan,
      },
      timestamp: now,
    });

    res.json({
      success: true,
      message: action === 'approve'
        ? 'Produk berhasil disetujui'
        : 'Produk ditolak',
      data: { id: rows[0].id, status: newStatus, catatan_admin: catatan || null },
    });
  } catch (error) {
    next(error);
  }
};

// =============================================
// PUT /produk/:id — Update produk
// =============================================
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

// =============================================
// DELETE /produk/:id
// =============================================
exports.remove = async (req, res, next) => {
  try {
    const produkId = req.params.id;

    // Cek apakah produk punya transaksi terkait
    const [transaksi] = await db.query(
      'SELECT COUNT(*) as count FROM transaksi WHERE produk_id = ?',
      [produkId]
    );

    if (transaksi[0].count > 0) {
      // Soft delete: set status = nonaktif (karena ada riwayat transaksi)
      await db.query(
        "UPDATE produk_panen SET status = 'nonaktif' WHERE id = ?",
        [produkId]
      );

      // Update Firestore
      await stokCollection.doc(String(produkId)).set(
        { status: 'nonaktif' },
        { merge: true }
      );

      return res.json({
        success: true,
        message: 'Produk dinonaktifkan (memiliki riwayat transaksi)',
      });
    }

    // Hard delete jika tidak ada transaksi
    const [result] = await db.query('DELETE FROM produk_panen WHERE id = ?', [produkId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    // Hapus di Firestore
    await stokCollection.doc(String(produkId)).delete();
    await fotoCollection.doc(String(produkId)).delete();

    res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};
