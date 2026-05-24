import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Box, 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  Activity,
  Bell, 
  User,
  LogOut
} from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Fungsi untuk Logout
  const handleLogout = () => {
    // Hapus data token dan user dari penyimpanan lokal
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Arahkan kembali ke halaman login
    navigate('/login');
  };

  // Daftar menu sesuai dengan struktur halaman di brief
  const menuItems = [
    { name: 'Dashboard Logistik', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Kelola Petani', path: '/petani', icon: <Users size={20} /> },
    { name: 'Produk Panen', path: '/produk', icon: <Box size={20} /> },
    { name: 'Transaksi', path: '/transaksi', icon: <ShoppingCart size={20} /> },
    { name: 'Pembayaran', path: '/pembayaran', icon: <CreditCard size={20} /> },
    { name: 'Pengiriman', path: '/pengiriman', icon: <Truck size={20} /> },
    { name: 'Stok Realtime', path: '/stok-realtime', icon: <Activity size={20} /> },
    { name: 'Notifikasi', path: '/notifikasi', icon: <Bell size={20} /> },
    { name: 'Profil', path: '/profil', icon: <User size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-green-800 text-white flex flex-col shadow-xl">
        <div className="p-6 text-2xl font-bold border-b border-green-700 flex items-center gap-2">
          <Box className="text-green-300" /> Admin Panen
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            // Mengecek apakah menu sedang aktif agar warnanya berbeda
            const isActive = location.pathname.includes(item.path);
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                  isActive ? 'bg-green-600 text-white shadow' : 'text-green-100 hover:bg-green-700 hover:text-white'
                }`}
              >
                {item.icon} 
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-green-700">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg transition-colors duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* AREA KONTEN UTAMA */}
      <main className="flex-1 overflow-y-auto">
        {/* Komponen Outlet ini adalah tempat dimana halaman-halaman lain (seperti halaman Petani, Produk, dll) akan dirender (dimunculkan) */}
        <div className="p-8">
            <Outlet /> 
        </div>
      </main>

    </div>
  );
}