import { useEffect, useState } from 'react';
import { User, Save } from 'lucide-react';
import api from '../api';

export default function Profil() {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    phone: '',
    alamat: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile'); //
      if (response.data.success) {
        setFormData(response.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil profil", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Endpoint PUT untuk update profil sesuai brief
      await api.put('/auth/profile', {
        nama: formData.nama,
        phone: formData.phone,
        alamat: formData.alamat
      });
      alert('Profil berhasil diperbarui!');
    } catch (error) {
      alert('Gagal memperbarui profil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Memuat profil...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <User className="text-green-600" size={28} /> Profil Admin
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleUpdateProfile} className="p-6 md:p-8 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Akun (Tidak dapat diubah)</label>
            <input 
              type="email" 
              value={formData.email} 
              disabled 
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500 outline-none cursor-not-allowed" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input 
                type="text" 
                name="nama" 
                value={formData.nama} 
                onChange={handleInputChange} 
                required 
                className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
            <textarea 
              name="alamat" 
              value={formData.alamat} 
              onChange={handleInputChange} 
              rows="3" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium shadow transition-colors ${
                saving ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <Save size={20} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}