import { useEffect, useState } from 'react';
import { Search, Plus, CreditCard, X, Eye } from 'lucide-react';
import api from '../api';

export default function Pembayaran() {
  const [pembayaran, setPembayaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // State untuk Modal Tambah Pembayaran
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    transaksi_id: '',
    metode: 'transfer',
    jumlah: ''
  });

  useEffect(() => {
    fetchPembayaran();
  }, []);

  const fetchPembayaran = async () => {
    try {
      setLoading(true);
      // Catatan: Jika endpoint GET /pembayaran semua belum ada, 
      // biasanya di-handle lewat list transaksi atau endpoint log pembayaran khusus.
      const response = await api.get('/pembayaran'); 
      if (response.data.success) {
        setPembayaran(response.data.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data pembayaran");
    } {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        transaksi_id: Number(formData.transaksi_id),
        metode: formData.metode,
        jumlah: Number(formData.jumlah)
      };

      // Menembak endpoint POST /pembayaran sesuai brief
      await api.post('/pembayaran', payload);
      
      setIsModalOpen(false);
      setFormData({ transaksi_id: '', metode: 'transfer', jumlah: '' });
      fetchPembayaran();
      alert('Pembayaran berhasil dicatat!');
    } catch (error) {
      alert('Gagal mencatat pembayaran. Periksa kembali ID Transaksi.');
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Pembayaran</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow transition-colors"
        >
          <Plus size={20} />
          Catat Pembayaran baru
        </button>
      </div>

      {/* FILTER SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-72">
          <input 
            type="text" 
            placeholder="Cari ID Transaksi..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      {/* TABEL DATA PEMBAYARAN */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600">ID Pembayaran</th>
                <th className="p-4 font-semibold text-gray-600">ID Transaksi</th>
                <th className="p-4 font-semibold text-gray-600">Metode</th>
                <th className="p-4 font-semibold text-gray-600">Jumlah Bayar</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Memuat data pembayaran...</td></tr>
              ) : pembayaran.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Belum ada riwayat pembayaran.</td></tr>
              ) : (
                pembayaran.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-gray-800">#PAY-{item.id}</td>
                    <td className="p-4 text-gray-600">#TXN-{item.transaksi_id}</td>
                    <td className="p-4">
                      {/* Badge Metode Pembayaran */}
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase
                        ${item.metode === 'transfer' ? 'bg-blue-100 text-blue-800' : ''}
                        ${item.metode === 'cod' ? 'bg-orange-100 text-orange-800' : ''}
                        ${item.metode === 'e-wallet' ? 'bg-purple-100 text-purple-800' : ''}
                      `}>
                        {item.metode}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gray-800">Rp {item.jumlah?.toLocaleString('id-ID')}</td>
                    <td className="p-4 flex justify-center">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={18} />
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
      {/* MODAL FORM TAMBAH PEMBAYARAN */}
      {/* ========================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <CreditCard className="text-green-600" /> Catat Pembayaran Baru
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Transaksi</label>
                <input 
                  type="number" 
                  name="transaksi_id" 
                  value={formData.transaksi_id} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Contoh: 1"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
                <select 
                  name="metode" 
                  value={formData.metode} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  <option value="transfer">Transfer Bank</option>
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="e-wallet">E-Wallet / QRIS</option>
                </select> {/* */}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Pembayaran (Rp)</label>
                <input 
                  type="number" 
                  name="jumlah" 
                  value={formData.jumlah} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Contoh: 400000"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none" 
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow">
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}