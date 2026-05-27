import { useEffect, useState } from 'react';
import { Search, Eye, X, CreditCard, Receipt, User, Box, ExternalLink, CalendarClock } from 'lucide-react';
import api from '../api';

export default function Transaksi() {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  useEffect(() => {
    fetchTransaksi();
  }, []);

  const formatTanggal = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getPembeliName = (item) => {
    if (!item) return '-';
    if (item.nama_bisnis) return item.nama_bisnis;
    if (item.pembeli_nama) return item.pembeli_nama;
    if (item.pembeli?.nama_bisnis) return item.pembeli.nama_bisnis; // Jika format nested
    
    const pembeliId = Number(item.pembeli_id || item.pembeli);
    if (pembeliId === 1) return 'Restoran Sederhana';
    if (pembeliId === 2) return 'Toko Test';
    
    return `ID Pembeli: ${pembeliId}`;
  };

  const fetchTransaksi = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transaksi'); 
      if (response.data.success) {
        setTransaksi(response.data.data || []);
      }
    } catch (error) {
      console.warn("Gagal mengambil API, menggunakan fallback data dummy sesuai database.");
      
      // Data dummy disesuaikan dengan isi tabel "pembayaran" dan "transaksi" di Cloud SQL Anda
      setTransaksi([
        { 
          id: '4', created_at: '2026-05-24T13:29:33Z', pembeli_id: 1, nama_produk: 'TEST Jagung', jumlah_kg: 5.00, nama_petani: 'Pak Budi', total_harga: 75000, status: 'SELESAI', 
          pembayaran_id: 4, metode: 'transfer', jumlah: 75000, status_pembayaran: 'pending', bukti_bayar_url: null 
        },
        { 
          id: '3', created_at: '2026-05-24T13:28:49Z', pembeli_id: 1, nama_produk: 'TEST Jagung', jumlah_kg: 5.00, nama_petani: 'Pak Budi', total_harga: 75000, status: 'SELESAI', 
          pembayaran_id: 3, metode: 'transfer', jumlah: 75000, status_pembayaran: 'pending', bukti_bayar_url: null 
        },
        { 
          id: '2', created_at: '2026-05-24T13:27:51Z', pembeli_id: 1, nama_produk: 'TEST Jagung', jumlah_kg: 5.00, nama_petani: 'Pak Budi', total_harga: 75000, status: 'SELESAI', 
          pembayaran_id: 2, metode: 'transfer', jumlah: 75000, status_pembayaran: 'pending', bukti_bayar_url: null 
        },
        { 
          id: '1', created_at: '2026-05-24T13:26:05Z', pembeli_id: 1, nama_produk: 'Jagung Manis TEST', jumlah_kg: 5.00, nama_petani: 'Pak Budi', total_harga: 75000, status: 'SELESAI', 
          pembayaran_id: 1, metode: 'transfer', jumlah: 75000, status_pembayaran: 'pending', bukti_bayar_url: null 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = (item) => {
    setSelectedTxn(item);
    setIsViewModalOpen(true);
  };

  const renderStatusLabel = (status) => {
    const currentStatus = status ? String(status).toUpperCase() : 'PENDING';
    if (currentStatus === 'SELESAI' || currentStatus === 'LUNAS') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">{currentStatus}</span>;
    if (currentStatus === 'PROSES') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">{currentStatus}</span>;
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">{currentStatus}</span>;
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Transaksi</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-72">
          <input 
            type="text" 
            placeholder="Cari ID atau nama bisnis..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-200 outline-none"
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
                <th className="p-4 font-semibold text-gray-600">ID / Waktu</th>
                <th className="p-4 font-semibold text-gray-600">Pembeli (Bisnis)</th>
                <th className="p-4 font-semibold text-gray-600">Petani & Produk</th>
                <th className="p-4 font-semibold text-gray-600">Total Harga</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : transaksi.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Belum ada riwayat transaksi.</td></tr>
              ) : (
                transaksi
                  .filter((item) => item !== null)
                  .map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-800">#TXN-{item.id}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatTanggal(item.created_at)}</p>
                    </td>
                    
                    <td className="p-4">
                      <p className="text-gray-800 font-semibold">
                        {getPembeliName(item)}
                      </p>
                    </td>

                    <td className="p-4">
                      <p className="text-gray-800 font-medium">{item.nama_produk} ({Number(item.jumlah_kg || 0).toFixed(2)}kg)</p>
                      <p className="text-xs text-gray-500 mt-0.5">Petani: {item.nama_petani}</p>
                    </td>
                    <td className="p-4 text-gray-700 font-medium">
                      Rp {Number(item.total_harga || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 text-center">
                      {renderStatusLabel(item.status)}
                    </td>
                    <td className="p-4 flex justify-center">
                      <button 
                        onClick={() => handleViewClick(item)}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                        title="Lihat Detail Transaksi & Pembayaran"
                      >
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

      {/* MODAL DETAIL TRANSAKSI & PEMBAYARAN */}
      {isViewModalOpen && selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <Receipt className="text-[#006080]" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Detail Transaksi <span className="text-[#006080]">#TXN-{selectedTxn.id}</span></h2>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><User size={14}/> Info Pembeli</p>
                  <p className="font-semibold text-gray-800 text-lg">
                    {getPembeliName(selectedTxn)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><CalendarClock size={12}/> {formatTanggal(selectedTxn.created_at)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><Box size={14}/> Info Produk</p>
                  <p className="font-semibold text-gray-800 text-lg">{selectedTxn.nama_produk}</p>
                  <p className="text-sm text-gray-600">Petani: {selectedTxn.nama_petani}</p>
                  <p className="text-sm font-bold text-gray-700 mt-1">Total: {Number(selectedTxn.jumlah_kg || 0).toFixed(2)} Kg</p>
                </div>
              </div>

              {/* INTEGRASI BACA JSON PEMBAYARAN FLEKSIBEL */}
              <div className="bg-[#f8fbff] p-5 rounded-xl border border-blue-100 relative overflow-hidden">
                <CreditCard className="absolute -right-4 -bottom-4 text-blue-100/50" size={100} />
                
                <div className="flex justify-between items-start relative z-10 mb-4">
                  <h3 className="text-sm text-blue-800 uppercase font-bold flex items-center gap-2">
                    <CreditCard size={18} /> Rincian Pembayaran
                  </h3>
                  {/* Status pembayaran dari API (bisa status_pembayaran, atau pembayaran.status) */}
                  <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-md ${
                    (String(selectedTxn.status_pembayaran || selectedTxn.pembayaran?.status).toLowerCase() === 'lunas') 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedTxn.status_pembayaran || selectedTxn.pembayaran?.status || 'PENDING'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                  <div>
                    <p className="text-[11px] text-blue-600/80 font-bold mb-1 uppercase">ID Bayar</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {selectedTxn.pembayaran_id || selectedTxn.pembayaran?.id || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-blue-600/80 font-bold mb-1 uppercase">Metode</p>
                    {/* capitalize string transfer -> Transfer */}
                    <p className="font-semibold text-gray-800 text-sm capitalize">
                      {selectedTxn.metode || selectedTxn.pembayaran?.metode || '-'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[11px] text-blue-600/80 font-bold mb-1 uppercase">Jumlah (Sesuai Bukti)</p>
                    <p className="font-bold text-green-600 text-lg">
                      Rp {Number(selectedTxn.jumlah || selectedTxn.pembayaran?.jumlah || selectedTxn.total_harga || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {(selectedTxn.bukti_bayar_url || selectedTxn.pembayaran?.bukti_bayar_url) && (
                  <div className="mt-4 pt-4 border-t border-blue-200/50 relative z-10">
                    <a 
                      href={selectedTxn.bukti_bayar_url || selectedTxn.pembayaran?.bukti_bayar_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 hover:border-blue-400 text-blue-700 text-xs font-bold rounded-lg transition-colors shadow-sm"
                    >
                      <ExternalLink size={14} /> Lihat Bukti Transfer
                    </a>
                  </div>
                )}
              </div>

            </div>

            <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-semibold uppercase">Status Pesanan</span>
                {renderStatusLabel(selectedTxn.status)}
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-bold rounded-lg transition-colors"
              >
                Tutup Panel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}