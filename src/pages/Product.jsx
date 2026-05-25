import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, X } from 'lucide-react';
import api from '../api';

export default function Produk() {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // State untuk mengontrol Modal (Popup
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State untuk menyimpan data inputan form
  const [formData, setFormData] = useState({
    nama_produk: '',
    kategori: 'Sayuran',
    harga_per_kg: '',
    stok_kg: '',
    deskripsi: '',
    foto_url: '',
    status: 'tersedia'
  });

  useEffect(() => {
    fetchProduk();
  }, []);

  const fetchProduk = async () => {
    try {
      setLoading(true);
      const response = await api.get('/produk'); //
      if (response.data.success) {
        setProduk(response.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data produk");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await api.delete(`/produk/${id}`); //
        fetchProduk();
      } catch (error) {
        alert('Gagal menghapus produk');
      }
    }
  };

  // Fungsi untuk menangani perubahan input form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fungsi untuk mengirim data (Simpan Produk Baru)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Menyiapkan payload sesuai format yang diminta API
      const payload = {
        ...formData,
        petani_id: 1, // Dummy ID petani sementara
        harga_per_kg: Number(formData.harga_per_kg),
        stok_kg: Number(formData.stok_kg)
      };

      await api.post('/produk', payload); //
      
      // Tutup modal, reset form, dan ambil ulang data tabel
      setIsModalOpen(false);
      setFormData({
        nama_produk: '', kategori: 'Sayuran', harga_per_kg: '',
        stok_kg: '', deskripsi: '', foto_url: '', status: 'tersedia'
      });
      fetchProduk();
      
    } catch (error) {
      alert('Gagal menyimpan produk. Cek koneksi API Anda.');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Produk Panen</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow transition-colors"
        >
          <Plus size={20} />
          Tambah Produk
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Cari nama produk..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Nama Produk</th>
                <th className="p-4 font-semibold text-gray-600">Kategori</th>
                <th className="p-4 font-semibold text-gray-600">Harga/kg</th>
                <th className="p-4 font-semibold text-gray-600">Stok (kg)</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : produk.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Belum ada data produk.</td></tr>
              ) : (
                produk.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{item.nama_produk}</td>
                    <td className="p-4 text-gray-600">{item.kategori}</td>
                    <td className="p-4 text-gray-600">Rp {item.harga_per_kg?.toLocaleString('id-ID')}</td>
                    <td className="p-4 text-gray-600">{item.stok_kg}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'tersedia' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================= */}
      {/* MODAL TAMBAH PRODUK */}
      {/* ========================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Tambah Produk Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                <input type="text" name="nama_produk" value={formData.nama_produk} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select name="kategori" value={formData.kategori} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500">
                    <option value="Sayuran">Sayuran</option>
                    <option value="Buah">Buah</option>
                    <option value="Biji-bijian">Biji-bijian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500">
                    <option value="tersedia">Tersedia</option>
                    <option value="habis">Habis</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga per Kg (Rp)</label>
                  <input type="number" name="harga_per_kg" value={formData.harga_per_kg} onChange={handleInputChange} required min="0" className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok (Kg)</label>
                  <input type="number" name="stok_kg" value={formData.stok_kg} onChange={handleInputChange} required min="0" className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Foto</label>
                <input type="url" name="foto_url" value={formData.foto_url} onChange={handleInputChange} placeholder="https://..." className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea name="deskripsi" value={formData.deskripsi} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow">Simpan Produk</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}