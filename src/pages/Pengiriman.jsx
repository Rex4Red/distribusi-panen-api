import { useEffect, useState } from 'react';
import { Search, Plus, Truck, Edit, Eye, X, MapPin } from 'lucide-react';
import api from '../api';

export default function Pengiriman() {
  const [pengiriman, setPengiriman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // State untuk Modal Tambah Pengiriman
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    transaksi_id: '',
    alamat_asal: 'Sleman, Yogyakarta', // Default sesuai contoh di brief
    alamat_tujuan: '',
    kurir: 'JNE',
    estimasi: ''
  });

  // State untuk Modal Update Status
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchPengiriman();
  }, []);

  const fetchPengiriman = async () => {
    try {
      setLoading(true);
      // Mengambil data tabel pengiriman
      const response = await api.get('/pengiriman'); 
      if (response.data.success) {
        setPengiriman(response.data.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data pengiriman");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FUNGSI UNTUK MEMBUAT PENGIRIMAN BARU
  // ==========================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        transaksi_id: Number(formData.transaksi_id)
      };

      await api.post('/pengiriman', payload); //
      setIsCreateModalOpen(false);
      setFormData({ transaksi_id: '', alamat_asal: 'Sleman, Yogyakarta', alamat_tujuan: '', kurir: 'JNE', estimasi: '' });
      fetchPengiriman();
      alert('Pengiriman berhasil dibuat!');
    } catch (error) {
      alert('Gagal membuat pengiriman. Pastikan ID Transaksi valid.');
    }
  };

  // ==========================================
  // FUNGSI UNTUK UPDATE STATUS PENGIRIMAN
  // ==========================================
  const openStatusModal = (item) => {
    setSelectedItem(item);
    setNewStatus(item.status);
    setIsStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/pengiriman/${selectedItem.id}/status`, { status: newStatus }); //
      setIsStatusModalOpen(false);
      fetchPengiriman();
      alert('Status pengiriman berhasil diperbarui!');
    } catch (error) {
      alert('Gagal memperbarui status pengiriman.');
    }
  };

  // Warna badge status sesuai alur
  const getStatusBadge = (status) => {
    switch (status) {
      case 'diproses': return 'bg-yellow-100 text-yellow-700';
      case 'dalam_perjalanan': return 'bg-blue-100 text-blue-700';
      case 'terkirim': return 'bg-green-100 text-green-700';
      case 'gagal': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Pengiriman</h1>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow transition-colors"
        >
          <Plus size={20} /> Buat Pengiriman
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-72">
          <input 
            type="text" 
            placeholder="Cari Resi atau Tujuan..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      {/* TABEL PENGIRIMAN */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600">ID Pengiriman</th>
                <th className="p-4 font-semibold text-gray-600">ID Transaksi</th>
                <th className="p-4 font-semibold text-gray-600">Kurir & Estimasi</th>
                <th className="p-4 font-semibold text-gray-600">Tujuan</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : pengiriman.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Belum ada data pengiriman.</td></tr>
              ) : (
                pengiriman.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-gray-800">#SHP-{item.id}</td>
                    <td className="p-4 text-gray-600">#TXN-{item.transaksi_id}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{item.kurir}</div>
                      <div className="text-sm text-gray-500">{item.estimasi}</div>
                    </td>
                    <td className="p-4 text-gray-600 max-w-xs truncate" title={item.alamat_tujuan}>
                      {item.alamat_tujuan}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                        {item.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => openStatusModal(item)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                        title="Update Status Pengiriman"
                      >
                        <Edit size={18} />
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
      {/* MODAL BUAT PENGIRIMAN BARU */}
      {/* ========================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Truck className="text-green-600" /> Buat Pengiriman Baru
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Transaksi</label>
                <input type="number" name="transaksi_id" value={formData.transaksi_id} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kurir</label>
                  <select name="kurir" value={formData.kurir} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500">
                    <option value="JNE">JNE</option>
                    <option value="J&T">J&T Express</option>
                    <option value="SiCepat">SiCepat</option>
                    <option value="Gosend">GoSend</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimasi Tiba</label>
                  <input type="text" name="estimasi" value={formData.estimasi} onChange={handleInputChange} placeholder="Contoh: 2-3 hari" required className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><MapPin size={16}/> Alamat Asal (Petani)</label>
                <textarea name="alamat_asal" value={formData.alamat_asal} onChange={handleInputChange} required rows="2" className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><MapPin size={16}/> Alamat Tujuan (Pembeli)</label>
                <textarea name="alamat_tujuan" value={formData.alamat_tujuan} onChange={handleInputChange} required rows="2" className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow">Simpan & Proses</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL UPDATE STATUS PENGIRIMAN */}
      {/* ========================================= */}
      {isStatusModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Update Status Resi</h2>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleStatusSubmit} className="p-5 space-y-4">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">ID Pengiriman</p>
                <p className="font-semibold text-gray-800">#SHP-{selectedItem.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Tracking:</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)} 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="diproses">Diproses</option>
                  <option value="dalam_perjalanan">Dalam Perjalanan</option>
                  <option value="terkirim">Terkirim</option>
                  <option value="gagal">Gagal / Retur</option>
                </select> {/* */}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow">Update Status</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}