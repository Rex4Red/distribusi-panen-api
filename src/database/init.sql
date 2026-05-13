-- =============================================
-- DATABASE: distribusi_panen
-- Jalankan script ini di MySQL / Cloud SQL
-- =============================================

CREATE DATABASE IF NOT EXISTS distribusi_panen;
USE distribusi_panen;

-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'petani', 'pembeli') DEFAULT 'petani',
  phone VARCHAR(20),
  alamat TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabel Petani
CREATE TABLE IF NOT EXISTS petani (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nama_usaha VARCHAR(150),
  lokasi VARCHAR(255),
  luas_lahan DECIMAL(10,2),
  jenis_tanaman VARCHAR(255),
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tabel Pembeli
CREATE TABLE IF NOT EXISTS pembeli (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nama_bisnis VARCHAR(150),
  tipe ENUM('restoran', 'tengkulak', 'lainnya') DEFAULT 'lainnya',
  alamat_bisnis TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Tabel Produk Panen
CREATE TABLE IF NOT EXISTS produk_panen (
  id INT AUTO_INCREMENT PRIMARY KEY,
  petani_id INT NOT NULL,
  nama_produk VARCHAR(150) NOT NULL,
  kategori VARCHAR(50),
  harga_per_kg DECIMAL(12,2) NOT NULL,
  stok_kg DECIMAL(10,2) NOT NULL,
  deskripsi TEXT,
  foto_url VARCHAR(500),
  status ENUM('tersedia', 'habis', 'nonaktif') DEFAULT 'tersedia',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (petani_id) REFERENCES petani(id) ON DELETE CASCADE
);

-- 5. Tabel Transaksi
CREATE TABLE IF NOT EXISTS transaksi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pembeli_id INT NOT NULL,
  petani_id INT NOT NULL,
  produk_id INT NOT NULL,
  jumlah_kg DECIMAL(10,2) NOT NULL,
  total_harga DECIMAL(15,2) NOT NULL,
  status ENUM('pending', 'dikonfirmasi', 'dikirim', 'selesai', 'dibatalkan') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pembeli_id) REFERENCES pembeli(id),
  FOREIGN KEY (petani_id) REFERENCES petani(id),
  FOREIGN KEY (produk_id) REFERENCES produk_panen(id)
);

-- 6. Tabel Pembayaran
CREATE TABLE IF NOT EXISTS pembayaran (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaksi_id INT NOT NULL,
  metode ENUM('transfer', 'cod', 'e-wallet') DEFAULT 'transfer',
  jumlah DECIMAL(15,2) NOT NULL,
  status ENUM('pending', 'berhasil', 'gagal') DEFAULT 'pending',
  bukti_bayar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaksi_id) REFERENCES transaksi(id) ON DELETE CASCADE
);

-- 7. Tabel Pengiriman
CREATE TABLE IF NOT EXISTS pengiriman (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaksi_id INT NOT NULL,
  alamat_asal TEXT NOT NULL,
  alamat_tujuan TEXT NOT NULL,
  kurir VARCHAR(100),
  estimasi VARCHAR(50),
  status ENUM('diproses', 'dalam_perjalanan', 'terkirim', 'gagal') DEFAULT 'diproses',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (transaksi_id) REFERENCES transaksi(id) ON DELETE CASCADE
);

-- =============================================
-- SAMPLE DATA (untuk testing)
-- =============================================

-- Admin user (password: admin123)
INSERT INTO users (nama, email, password, role, phone, alamat) VALUES
('Admin Sistem', 'admin@panen.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '081234567890', 'Yogyakarta');

-- Petani user (password: petani123)
INSERT INTO users (nama, email, password, role, phone, alamat) VALUES
('Pak Budi', 'budi@panen.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'petani', '081234567891', 'Sleman, Yogyakarta');

INSERT INTO petani (user_id, nama_usaha, lokasi, luas_lahan, jenis_tanaman) VALUES
(2, 'Tani Makmur Budi', 'Sleman, Yogyakarta', 2.5, 'Sayuran');

-- Pembeli user (password: pembeli123)
INSERT INTO users (nama, email, password, role, phone, alamat) VALUES
('Restoran Sederhana', 'restoran@panen.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pembeli', '081234567892', 'Kota Yogyakarta');

INSERT INTO pembeli (user_id, nama_bisnis, tipe, alamat_bisnis) VALUES
(3, 'Restoran Sederhana', 'restoran', 'Jl. Malioboro No. 1, Yogyakarta');

-- Sample produk
INSERT INTO produk_panen (petani_id, nama_produk, kategori, harga_per_kg, stok_kg, deskripsi, status) VALUES
(1, 'Tomat Merah', 'Sayuran', 8000, 150, 'Tomat merah segar dari kebun', 'tersedia'),
(1, 'Cabai Rawit', 'Sayuran', 45000, 50, 'Cabai rawit super pedas', 'tersedia'),
(1, 'Beras Organik', 'Padi', 15000, 500, 'Beras organik premium', 'tersedia');
