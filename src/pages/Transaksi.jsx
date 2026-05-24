import { useEffect, useState } from 'react';
import { Search, Edit, Eye, X } from 'lucide-react';
import api from '../api';

export default function Transaksi() {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // State untuk Modal Update Status
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchTransaksi();
  }, []);

  const fetchTransaksi = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transaksi'); //
      if (response.data.success) {
        setTransaksi(response.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data transaksi");
    } finally {
      setLoading(false);
    }
  };

  // Membuka modal dan menyimpan data transaksi yang dipilih
  const handleOpenStatusModal = (tx) => {
    setSelectedTx(tx);
    setNewStatus(tx.status); // Set default pilihan ke status saat ini
    setIsModalOpen(true);
  };

  // Mengirim perubahan status ke API
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/transaksi/${selectedTx.id}`, { status: newStatus }); //
      setIsModalOpen(false);
      fetchTransaksi(); // Refresh data tabel
      alert('Status transaksi berhasil diperbarui!');
    } catch (error) {
      alert('Gagal memperbarui status transaksi.');
    }
  };

  // Fungsi pembantu untuk memberi warna badge status yang berbeda
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'dikonfirmasi': return 'bg-blue-100 text-blue-700';
      case 'dikirim': return 'bg-purple-100 text-purple-700';
      case 'selesai': return 'bg-green-100 text-green-700';
      case 'dibatalkan': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Transaksi</h1>
      </div>

      {/* FILTER & PENCARIAN */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-72">
          <input 
            type="text" 
            placeholder="Cari ID atau nama pembeli..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      {/* TABEL TRANSAKSI */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600">ID / Tanggal</th>
                <th className="p-4 font-semibold text-gray-600">Pembeli</th>
                <th className="p-4 font-semibold text-gray-600">Petani & Produk</th>
                <th className="p-4 font-semibold text-gray-600">Total Harga</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : transaksi.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Belum ada transaksi.</td></tr>
              ) : (
                transaksi.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">#TXN-{item.id}</div>
                      <div className="text-sm text-gray-500">{item.tanggal}</div>
                    </td>
                    <td className="p-4 text-gray-800">{item.nama_pembeli}</td>
                    <td className="p-4">
                      <div className="text-gray-800">{item.nama_produk} ({item.jumlah_kg}kg)</div>
                      <div className="text-sm text-gray-500">Petani: {item.nama_petani}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-800">Rp {item.total_harga?.toLocaleString('id-ID')}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleOpenStatusModal(item)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Update Status"
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
      {/* MODAL UPDATE STATUS */}
      {/* ========================================= */}
      {isModalOpen && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Update Status Transaksi</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateStatus} className="p-5 space-y-4">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">ID Transaksi</p>
                <p className="font-semibold text-gray-800">#TXN-{selectedTx.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubah Status Menjadi:</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)} 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="pending">Pending</option>
                  <option value="dikonfirmasi">Dikonfirmasi</option>
                  <option value="dikirim">Dikirim</option>
                  <option value="selesai">Selesai</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}