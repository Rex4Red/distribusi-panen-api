-- =============================================
-- Phase 1: Approval Produk - Database Migration
-- =============================================
-- Jalankan di Cloud SQL (MySQL)
-- =============================================

-- 1. Update ENUM status untuk tambah 'menunggu_verifikasi' dan 'ditolak'
ALTER TABLE produk_panen 
  MODIFY COLUMN status 
  ENUM('menunggu_verifikasi', 'tersedia', 'habis', 'nonaktif', 'ditolak') 
  DEFAULT 'menunggu_verifikasi';

-- 2. Tambah kolom untuk tracking approval
ALTER TABLE produk_panen
  ADD COLUMN catatan_admin VARCHAR(255) NULL AFTER status,
  ADD COLUMN verified_at DATETIME NULL AFTER catatan_admin,
  ADD COLUMN verified_by INT NULL AFTER verified_at;

-- 3. (Opsional) Update produk yang sudah ada agar tetap 'tersedia'
-- Ini agar produk lama yang sudah ada tidak berubah status
UPDATE produk_panen SET status = 'tersedia' WHERE status = 'tersedia';
