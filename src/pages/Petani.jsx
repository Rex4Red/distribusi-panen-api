import { useEffect, useState } from 'react';
import { Search, Eye, Edit, X, Trash2 } from 'lucide-react';
import api from '../api';

export default function Petani() {
  const [petani, setPetani] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // State untuk Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: null,
    nama: '',
    email: '',
    phone: '',
    nama_usaha: '',
    lokasi: '',
    jenis_tanaman: ''
  });

  useEffect(() => {
    fetchPetani();
  }, []);

  const fetchPetani = async () => {
    try {
      setLoading(true);
      const response = await api.get('/petani'); //
      if (response.data.success) {
        setPetani(response.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data petani");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk membuka modal dan mengisi form dengan data petani yang dipilih
  const handleEditClick = (petaniData) => {
    setEditData(petaniData);
    setIsEditModalOpen(true);
  };

  // Fungsi untuk menangani perubahan input form edit
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // Fungsi untuk menyimpan perubahan data ke server
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Mengirim request PUT ke endpoint edit petani
      await api.put(`/petani/${editData.id}`, editData);
      
      setIsEditModalOpen(false);
      fetchPetani(); // Refresh data tabel
      alert('Data petani berhasil diperbarui!');
    } catch (error) {
      alert('Gagal memperbarui data. Cek koneksi API Anda.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data petani ini?")) {
      try {
        await api.delete(`/petani/${id}`); // Memanggil API hapus
        fetchPetani(); // Refresh tabel setelah hapus
        alert('Data petani berhasil dihapus!');
      } catch (error) {
        alert('Gagal menghapus data petani.');
      }
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Mitra Petani</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-72">
          <input 
            type="text" 
            placeholder="Cari nama atau lokasi petani..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Nama Petani</th>
                <th className="p-4 font-semibold text-gray-600">Kontak</th>
                <th className="p-4 font-semibold text-gray-600">Nama Usaha</th>
                <th className="p-4 font-semibold text-gray-600">Lokasi</th>
                <th className="p-4 font-semibold text-gray-600">Tanaman</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : petani.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Belum ada data petani yang terdaftar.</td></tr>
              ) : (
                petani.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{item.nama}</div>
                      <div className="text-sm text-gray-500">{item.email}</div>
                    </td>
                    <td className="p-4 text-gray-600">{item.phone}</td>
                    <td className="p-4 text-gray-600">{item.nama_usaha}</td>
                    <td className="p-4 text-gray-600">{item.lokasi}</td>
                    <td className="p-4 text-gray-600">{item.jenis_tanaman}</td>
                    <td className="p-4 flex justify-center gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                        <Eye size={16} /> 
                      </button>
                      {/* Tombol Edit Baru */}
                      <button 
                        onClick={() => handleEditClick(item)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                      >
                        <Edit size={16} /> </button>
                        
                        <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
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
      {/* MODAL EDIT PETANI */}
      {/* ========================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Edit Data Petani</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input type="text" name="nama" value={editData.nama} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                  <input type="text" name="phone" value={editData.phone} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={editData.email} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Usaha / Pertanian</label>
                <input type="text" name="nama_usaha" value={editData.nama_usaha} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Tanaman Utama</label>
                <input type="text" name="jenis_tanaman" value={editData.jenis_tanaman} onChange={handleInputChange} placeholder="Contoh: Sayuran organik, Padi, dll" className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi Lengkap</label>
                <textarea name="lokasi" value={editData.lokasi} onChange={handleInputChange} rows="2" className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow transition-colors">
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