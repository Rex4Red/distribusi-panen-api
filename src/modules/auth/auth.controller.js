const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/mysql');

const allowedRoles = ['admin', 'petani', 'pembeli'];

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

const signToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const getProfileByUserId = async (userId) => {
  const [users] = await db.query(
    'SELECT id, nama, email, role, phone, alamat, created_at, updated_at FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) return null;

  const user = users[0];
  if (user.role === 'petani') {
    const [petani] = await db.query(
      'SELECT id, user_id, nama_usaha, lokasi, luas_lahan, jenis_tanaman, rating, created_at FROM petani WHERE user_id = ?',
      [userId]
    );
    user.petani = petani[0] || null;
  }

  if (user.role === 'pembeli') {
    const [pembeli] = await db.query(
      'SELECT id, user_id, nama_bisnis, tipe, alamat_bisnis, created_at FROM pembeli WHERE user_id = ?',
      [userId]
    );
    user.pembeli = pembeli[0] || null;
  }

  return user;
};

// POST /auth/register
exports.register = async (req, res, next) => {
  let connection;

  try {
    // Mengambil data user dan data tambahan berdasarkan role
    const {
      nama,
      email,
      password,
      role = 'petani',
      phone = null,
      alamat = null,
      nama_usaha = null,
      lokasi = null,
      luas_lahan = null,
      jenis_tanaman = null,
      nama_bisnis = null,
      tipe = 'lainnya',
      alamat_bisnis = null,
    } = req.body;

    // Validasi input
    if (!nama || !email || !password) {
      return res.status(400).json({ success: false, message: 'nama, email, dan password wajib diisi' });
    }

    // Validasi role user
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role tidak valid. Gunakan: ${allowedRoles.join(', ')}`,
      });
    }

    // Cek apakah email sudah terdaftar
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    // Membuat koneksi transaction MySQL
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Enkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Menyimpan data user
    const [userResult] = await connection.query(
      'INSERT INTO users (nama, email, password, role, phone, alamat) VALUES (?, ?, ?, ?, ?, ?)',
      [nama, email, hashedPassword, role, phone, alamat]
    );

    const userId = userResult.insertId;
    let roleProfile = null;

    // Menyimpan data tambahan berdasarkan role
    if (role === 'petani') {
      const [petaniResult] = await connection.query(
        'INSERT INTO petani (user_id, nama_usaha, lokasi, luas_lahan, jenis_tanaman) VALUES (?, ?, ?, ?, ?)',
        [userId, nama_usaha, lokasi, luas_lahan, jenis_tanaman]
      );
      roleProfile = { id: petaniResult.insertId, user_id: userId, nama_usaha, lokasi, luas_lahan, jenis_tanaman };
    }

    if (role === 'pembeli') {
      const [pembeliResult] = await connection.query(
        'INSERT INTO pembeli (user_id, nama_bisnis, tipe, alamat_bisnis) VALUES (?, ?, ?, ?)',
        [userId, nama_bisnis, tipe, alamat_bisnis]
      );
      roleProfile = { id: pembeliResult.insertId, user_id: userId, nama_bisnis, tipe, alamat_bisnis };
    }

    // Menyimpan seluruh perubahan ke database
    await connection.commit();

    // Menyiapkan data user untuk response
    const user = { id: userId, nama, email, role, phone, alamat };
    if (roleProfile) user[role] = roleProfile;

    // Mengirim token JWT dan data user
    res.status(201).json({
      success: true,
      message: 'Register berhasil',
      data: {
        token: signToken(user),
        user,
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

// POST /auth/login
exports.login = async (req, res, next) => {
  try {
    // Mengambil email dan password
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email dan password wajib diisi' });
    }

    // Mencari user berdasarkan email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const user = users[0];

    // Memeriksa password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    // Mengirim token JWT dan data user tanpa password
    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token: signToken(user),
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /auth/profile
exports.getProfile = async (req, res, next) => {
  try {
    // Mengambil data user berdasarkan id dari token JWT
    const profile = await getProfileByUserId(req.user.id);

    // Memeriksa apakah user ditemukan
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    // Mengirim data user
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// PUT /auth/profile
exports.updateProfile = async (req, res, next) => {
  let connection;

  try {
    // Mengambil data user berdasarkan id dari token JWT
    const profile = await getProfileByUserId(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    // Menentukan field user yang boleh diupdate
    const userFields = ['nama', 'phone', 'alamat'];
    const userUpdates = [];
    const userParams = [];

    // Menyusun query update untuk tabel users
    for (const field of userFields) {
      if (req.body[field] !== undefined) {
        userUpdates.push(`${field} = ?`);
        userParams.push(req.body[field]);
      }
    }

    // Membuat koneksi transaction MySQL
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Memperbarui data user
    if (userUpdates.length > 0) {
      userParams.push(req.user.id);
      await connection.query(`UPDATE users SET ${userUpdates.join(', ')} WHERE id = ?`, userParams);
    }

    // Update data tambahan berdasarkan role
    if (profile.role === 'petani') {
      const petaniFields = ['nama_usaha', 'lokasi', 'luas_lahan', 'jenis_tanaman'];
      const petaniUpdates = [];
      const petaniParams = [];

      for (const field of petaniFields) {
        if (req.body[field] !== undefined) {
          petaniUpdates.push(`${field} = ?`);
          petaniParams.push(req.body[field]);
        }
      }

      if (petaniUpdates.length > 0) {
        petaniParams.push(req.user.id);
        await connection.query(`UPDATE petani SET ${petaniUpdates.join(', ')} WHERE user_id = ?`, petaniParams);
      }
    }

    if (profile.role === 'pembeli') {
      const pembeliFields = ['nama_bisnis', 'tipe', 'alamat_bisnis'];
      const pembeliUpdates = [];
      const pembeliParams = [];

      for (const field of pembeliFields) {
        if (req.body[field] !== undefined) {
          pembeliUpdates.push(`${field} = ?`);
          pembeliParams.push(req.body[field]);
        }
      }

      if (pembeliUpdates.length > 0) {
        pembeliParams.push(req.user.id);
        await connection.query(`UPDATE pembeli SET ${pembeliUpdates.join(', ')} WHERE user_id = ?`, pembeliParams);
      }
    }

    // Menyimpan perubahan ke database
    await connection.commit();

    // Mengambil data user yang telah diupdate
    const updatedProfile = await getProfileByUserId(req.user.id);
    res.json({
      success: true,
      message: 'Profile berhasil diupdate',
      data: updatedProfile,
    });
  } catch (error) {
    // Membatalkan seluruh perubahan jika terjadi kesalahan
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
};
