import { useEffect, useState } from 'react';
import { Search, Edit2, X, Activity } from 'lucide-react';
import api from '../api';

export default function StokRealtime() {
  const [stok, setStok] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // State untuk Modal Update Stok
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newStok, setNewStok] = useState('');

  useEffect(() => {
    fetchStok();
  }, []);

  const fetchStok = async () => {
    try {
      setLoading(true);
      // Mengambil data stok realtime
      const response = await api.get('/stok-realtime'); 
      if (response.data.success) {
        setStok(response.data.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data stok realtime");
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (item) => {
    setSelectedItem(item);
    setNewStok(item.stok_kg); // Set nilai awal di form sesuai stok saat ini
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      // Menembak endpoint PUT /stok-realtime/:id
      await api.put(`/stok-realtime/${selectedItem.id}`, { 
        stok_kg: Number(newStok) 
      });
      
      setIsModalOpen(false);
      fetchStok();
      alert('Stok berhasil diperbarui!');
    } catch (error) {
      alert('Gagal memperbarui stok.');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-green-600" /> Monitoring Stok Realtime
          </h1>
          <p className="text-gray-500 mt-1">Pantau dan sesuaikan ketersediaan produk</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-72">
          <input 
            type="text" 
            placeholder="Cari nama produk..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        <button onClick={fetchStok} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors">
          Refresh Data
        </button>
      </div>

      {/* TABEL DATA STOK */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600">ID / Nama Produk</th>
                <th className="p-4 font-semibold text-gray-600">Kategori</th>
                <th className="p-4 font-semibold text-gray-600">Petani</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Sisa Stok (Kg)</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Memuat data stok...</td></tr>
              ) : stok.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Belum ada data produk terdaftar.</td></tr>
              ) : (
                stok.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{item.nama_produk}</div>
                      <div className="text-sm text-gray-500">ID: PRD-{item.id}</div>
                    </td>
                    <td className="p-4 text-gray-600">{item.kategori}</td>
                    <td className="p-4 text-gray-600">{item.nama_petani}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1.5 rounded-lg font-bold text-lg
                        ${item.stok_kg > 50 ? 'bg-green-100 text-green-700' : 
                          item.stok_kg > 10 ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'}
                      `}>
                        {item.stok_kg}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center">
                      <button 
                        onClick={() => openUpdateModal(item)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors font-medium text-sm"
                      >
                        <Edit2 size={16} /> Update Stok
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================= */}
      {/* MODAL UPDATE STOK */}
      {/* ========================================= */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Sesuaikan Stok</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="p-5 space-y-4">
              <div className="mb-2">
                <p className="text-sm text-gray-500 mb-1">Nama Produk</p>
                <p className="font-semibold text-gray-800">{selectedItem.nama_produk}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Stok Baru (Kg)</label>
                <input 
                  type="number" 
                  value={newStok} 
                  onChange={(e) => setNewStok(e.target.value)} 
                  required 
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none text-lg font-semibold"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}