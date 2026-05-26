import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import api from '../api'; // Memanggil konfigurasi axios

export default function Login() {
  // State untuk form & API
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State untuk UI Avatar
  const [avatarPreview, setAvatarPreview] = useState(null);
  const navigate = useNavigate();

  // Efek untuk memuat gambar profil secara dinamis
  useEffect(() => {
    const savedImg = localStorage.getItem('adminProfileImg');
    
    if (savedImg) {
      setAvatarPreview(savedImg);
    } 
    else if (email.length > 0) {
      const namePrefix = email.split('@')[0];
      setAvatarPreview(`https://ui-avatars.com/api/?name=${namePrefix}&background=151515&color=fff&size=128`);
    } 
    else {
      setAvatarPreview(null);
    }
  }, [email]);

  // Fungsi Logika API Backend
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Mengirim request POST ke endpoint login
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        // Menyimpan token dan data user ke localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // PENTING: Simpan email agar sidebar Layout bisa membacanya
        localStorage.setItem('adminEmail', email); 
        
        // Mengarahkan admin ke halaman dashboard setelah sukses
        navigate('/dashboard');
      }
    } catch (err) {
      // Menangkap dan menampilkan pesan error dari server
      setError(err.response?.data?.message || 'Gagal login. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#151515] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Dekorasi Abstrak */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* Kartu Login Putih */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 md:p-14 shadow-2xl z-10 flex flex-col items-center">
        
        {/* GAMBAR PROFIL DINAMIS */}
        <div className="w-24 h-24 bg-[#151515] rounded-full flex items-center justify-center mb-6 shadow-lg overflow-hidden border-4 border-gray-50 transition-all duration-300">
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

        {/* PESAN ERROR (Jika ada) */}
        {error && (
          <div className="w-full bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl mb-6 text-sm font-medium text-center">
            {error}
          </div>
        )}

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

          {/* TOMBOL LOGIN DENGAN LOADING STATE */}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-4 rounded-xl shadow-md transition-all duration-300 mt-4 tracking-widest text-lg uppercase flex justify-center items-center ${
              loading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-[#151515] hover:bg-black text-white hover:shadow-xl'
            }`}
          >
            {loading ? 'MEMPROSES...' : 'LOGIN'}
          </button>
        </form>

        <p className="mt-10 text-gray-400 text-sm font-medium">
          Distribusi Panen &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}