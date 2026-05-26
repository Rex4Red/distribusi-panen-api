import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const navigate = useNavigate();

  // Efek untuk memuat gambar profil secara dinamis
  useEffect(() => {
    // 1. Coba ambil foto dari galeri lokal yang sudah disimpan user
    const savedImg = localStorage.getItem('adminProfileImg');
    
    if (savedImg) {
      setAvatarPreview(savedImg);
    } 
    // 2. Jika tidak ada foto, buat avatar otomatis dari email yang diketik
    else if (email.length > 0) {
      // Mengambil huruf pertama sebelum tanda @
      const namePrefix = email.split('@')[0];
      setAvatarPreview(`https://ui-avatars.com/api/?name=${namePrefix}&background=151515&color=fff&size=128`);
    } 
    // 3. Jika email kosong dan tidak ada foto
    else {
      setAvatarPreview(null);
    }
  }, [email]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulasi login sukses
    localStorage.setItem('token', 'dummy-token');
    navigate('/dashboard');
  };

  return (
    <div className="h-screen w-full bg-[#151515] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Dekorasi Abstrak (Netral, bukan biru) */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* Kartu Login Putih */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 md:p-14 shadow-2xl z-10 flex flex-col items-center">
        
        {/* GAMBAR PROFIL DINAMIS */}
        <div className="w-24 h-24 bg-[#151515] rounded-full flex items-center justify-center mb-10 shadow-lg overflow-hidden border-4 border-gray-50 transition-all duration-300">
          {avatarPreview ? (
            <img 
              src={avatarPreview} 
              alt="User Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon size={40} className="text-white opacity-80" />
          )}
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-8">
          
          {/* Input Email */}
          <div className="relative flex items-center border-b-2 border-gray-200 focus-within:border-[#151515] transition-colors pb-2">
            <Mail className="text-gray-400 mr-4" size={22} />
            <input 
              type="email" 
              placeholder="Email ID"
              className="bg-transparent w-full text-gray-800 outline-none placeholder:text-gray-400 text-lg font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Input Password */}
          <div className="relative flex items-center border-b-2 border-gray-200 focus-within:border-[#151515] transition-colors pb-2">
            <Lock className="text-gray-400 mr-4" size={22} />
            <input 
              type="password" 
              placeholder="Password"
              className="bg-transparent w-full text-gray-800 outline-none placeholder:text-gray-400 text-lg font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Lupa Password */}
          {/* <div className="flex justify-end">
            <a href="#" className="text-sm text-gray-500 hover:text-[#151515] font-semibold transition-colors">
              forgot password?
            </a>
          </div> */}

          {/* TOMBOL LOGIN - Warna Monokrom Gelap */}
          <button 
            type="submit"
            className="w-full bg-[#151515] hover:bg-black text-white font-bold py-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 mt-4 tracking-widest text-lg uppercase"
          >
            LOGIN
          </button>
        </form>

        <p className="mt-10 text-gray-400 text-sm font-medium">
          Distribusi Panen &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}