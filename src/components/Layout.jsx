import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
// Tambahkan ikon Camera untuk efek hover
import { LayoutDashboard, Users, Box, ShoppingCart, CreditCard, Truck, BarChart2, Bell, User, LogOut, Camera } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  
  // 1. Ref untuk memicu input file yang disembunyikan
  const fileInputRef = useRef(null);
  
  // 2. State untuk menyimpan foto profil (mengambil dari localStorage jika ada)
  const [profileImg, setProfileImg] = useState(() => {
    return localStorage.getItem('adminProfileImg') || "https://ui-avatars.com/api/?name=Admin+Panen&background=FFB800&color=fff";
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // 3. Fungsi untuk menangani saat foto dipilih dari galeri
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Membaca file gambar dan mengubahnya menjadi format Base64 (URL)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfileImg(base64String); // Update UI seketika
        localStorage.setItem('adminProfileImg', base64String); // Simpan permanen di browser
      };
      reader.readAsDataURL(file);
    }
  };

  // 4. Fungsi untuk membuka dialog file saat avatar diklik
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Data Petani', path: '/petani', icon: <Users size={20} /> },
    { name: 'Produk Panen', path: '/produk', icon: <Box size={20} /> },
    { name: 'Transaksi', path: '/transaksi', icon: <ShoppingCart size={20} /> },
    { name: 'Pembayaran', path: '/pembayaran', icon: <CreditCard size={20} /> },
    { name: 'Pengiriman', path: '/pengiriman', icon: <Truck size={20} /> },
    { name: 'Stok Realtime', path: '/stok-realtime', icon: <BarChart2 size={20} /> },
    { name: 'Notifikasi', path: '/notifikasi', icon: <Bell size={20} /> },
    { name: 'Profil', path: '/profil', icon: <User size={20} /> },
  ];

  return (
    <div className="h-screen w-full bg-[#151515] flex overflow-hidden">
        
      {/* SIDEBAR GELAP */}
      <aside className="w-64 md:w-72 flex flex-col py-8 pl-8 pr-6 text-[#999999] shrink-0">
        
        {/* PROFIL USER */}
        <div className="mb-10 flex flex-col gap-3">
          
          {/* Avatar Interaktif yang Bisa Diklik */}
          <div 
            className="relative w-14 h-14 cursor-pointer group"
            onClick={handleAvatarClick}
            title="Klik untuk ubah foto profil"
          >
            <img 
              src={profileImg} 
              alt="Profile" 
              className="w-full h-full rounded-2xl object-cover transition-all duration-300 group-hover:brightness-50"
            />
            
            {/* Ikon Kamera Transparan saat di-hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Camera size={20} className="text-white" />
            </div>
            
            {/* Titik Notifikasi Merah (Z-index agar tidak tertutup overlay) */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-[3px] border-[#151515] rounded-full z-10"></span>
          </div>

          {/* Input File Tersembunyi */}
          <input 
            type="file" 
            accept="image/png, image/jpeg, image/jpg" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
          />

          <div className="mt-1">
            <h2 className="text-white font-bold text-xl tracking-wide">Admin Panen</h2>
            <p className="text-sm opacity-70 mt-0.5">admin@distribusi.com</p>
          </div>
        </div>

        {/* Navigasi Sidebar */}
        <nav className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 py-3 px-4 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? 'text-white bg-[#2A2A2A] font-semibold shadow-sm' 
                    : 'hover:text-white hover:bg-white/5'
                }`
              }
            >
              {item.icon}
              <span className="text-[15px]">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Tombol Logout di Bawah */}
        <div className="pt-6 mt-6 border-t border-gray-800/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 py-3 px-4 w-full text-left hover:text-white hover:bg-red-500/10 rounded-2xl transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="text-[15px]">Logout</span>
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA PUTIH */}
      <main className="flex-1 bg-white rounded-4xl my-3 mr-3 p-8 md:p-12 overflow-y-auto relative custom-scrollbar">
        <Outlet />
      </main>

    </div>
  );
}