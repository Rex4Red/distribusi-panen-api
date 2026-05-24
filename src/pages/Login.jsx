import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Memanggil konfigurasi axios yang kita buat di Langkah 4

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        
        // Mengarahkan admin ke halaman dashboard setelah sukses
        navigate('/dashboard');
      }
    } catch (err) {
      // Menangkap dan menampilkan pesan error dari server (misal: password salah)
      setError(err.response?.data?.message || 'Gagal login. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border-t-4 border-green-600">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-green-800">Admin Panen</h2>
          <p className="text-gray-500 mt-2">Silakan login untuk mengelola sistem</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="admin@panen.com"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-white font-semibold py-2 px-4 rounded-lg transition-colors ${
              loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        {/* Info akun test untuk memudahkan pengujian */}
        <div className="mt-8 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="font-semibold mb-1 text-gray-800">📌 Akun Test Admin:</p>
          <p>Email: <span className="font-mono bg-gray-200 px-1 rounded">admin@panen.com</span></p>
          <p>Pass: <span className="font-mono bg-gray-200 px-1 rounded">admin123</span></p>
        </div>

      </div>
    </div>
  );
}