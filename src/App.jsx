import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Produk from './pages/Product';
import Petani from './pages/Petani';
import Transaksi from './pages/Transaksi';
import Dashboard from './pages/Dashboard';
import Pembayaran from './pages/Pembayaran';
import Pengiriman from './pages/Pengiriman';
import StokRealtime from './pages/StokRealtime';
import Notifikasi from './pages/Notifikasi';
import Profil from './pages/Profil';

// ==========================================
// 🛡️ KOMPONEN PROTEKSI (GUARD)
// =========================================
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// ==========================================
// KUMPULAN HALAMAN SEMENTARA (DUMMY)
// ==========================================
const StokRealtimePlaceholder = () => <div className="text-2xl font-bold">Halaman Stok Realtime</div>;
const NotifikasiPlaceholder = () => <div className="text-2xl font-bold">Halaman Notifikasi</div>;
const ProfilPlaceholder = () => <div className="text-2xl font-bold">Halaman Profil Admin</div>;

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Publik */}
        <Route path="/login" element={<Login />} />

        {/* ========================================== */}
        {/* RUTE PRIVAT (DIBUNGKUS LAYOUT & SIDEBAR)     */}
        {/* ========================================== */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Rute yang sudah kita buat */}
          <Route path="petani" element={<Petani />} />
          <Route path="produk" element={<Produk />} />
          <Route path="transaksi" element={<Transaksi />} />
          <Route path="pembayaran" element={<Pembayaran />} />
          <Route path="pengiriman" element={<Pengiriman />} />
          <Route path="stok-realtime" element={<StokRealtime />} />
          <Route path="notifikasi" element={<Notifikasi />} />
          <Route path="profil" element={<Profil />} />

        </Route> {/* <-- Pastikan tag penutup Route induk ini ada di sini! */}

        {/* Rute 404 (Jika URL tidak ada di daftar) */}
        <Route path="*" element={<div className="p-10 text-center text-red-500 text-2xl font-bold">404 - Halaman Tidak Ditemukan</div>} />
      </Routes>
    </Router>
  );
}