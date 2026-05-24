const multer = require('multer');

// Simpan di memory (buffer) karena akan langsung upload ke GCS
const storage = multer.memoryStorage();

// Filter hanya terima file gambar
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPEG, PNG, WebP) yang diperbolehkan'), false);
  }
};

// Konfigurasi upload: max 3 foto, masing-masing max 5MB
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 3, // max 3 file
  },
});

module.exports = upload;
