import { useEffect, useState } from 'react';
import { Package, Clock, Truck, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '../api';

export default function Dashboard() {
  const [logistik, setLogistik] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    diproses: 0,
    dalam_perjalanan: 0,
    terkirim: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/logistik/status');
      
      if (response.data.success) {
        setLogistik(response.data.data || []);
        if (response.data.summary) {
          setSummary(response.data.summary);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data dashboard logistik");
    } finally {
      setLoading(false);
    }
  };

  const formatTanggal = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'diproses': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'dalam_perjalanan': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'terkirim': return 'bg-green-100 text-green-700 border border-green-200';
      case 'gagal': return 'bg-red-100 text-red-700 border border-red-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'diproses': return 'DIPROSES';
      case 'dalam_perjalanan': return 'DALAM PERJALANAN';
      case 'terkirim': return 'TERKIRIM';
      case 'gagal': return 'GAGAL';
      default: return status ? status.toUpperCase() : '-';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Logistik</h1>
        <p className="text-gray-500 mt-1">Monitoring status pengiriman dan stok secara realtime</p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-gray-600">
            <Package size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Pengiriman</p>
            <p className="text-2xl font-bold text-gray-800">{loading ? '...' : summary.total}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-yellow-50 rounded-lg text-yellow-600">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Sedang Diproses</p>
            <p className="text-2xl font-bold text-gray-800">{loading ? '...' : summary.diproses}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-lg text-blue-600">
            <Truck size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Dalam Perjalanan</p>
            <p className="text-2xl font-bold text-gray-800">{loading ? '...' : summary.dalam_perjalanan}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-50 rounded-lg text-green-600">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Terkirim</p>
            <p className="text-2xl font-bold text-gray-800">{loading ? '...' : summary.terkirim}</p>
          </div>
        </div>
      </div>

      {/* TABEL MONITORING PENGIRIMAN REALTIME */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">Status Pengiriman Terbaru</h2>
          <button 
            onClick={fetchDashboardData} 
            disabled={loading}
            className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Data
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600">ID Transaksi</th>
                <th className="p-4 font-semibold text-gray-600">Produk</th>
                <th className="p-4 font-semibold text-gray-600">Pembeli</th>
                <th className="p-4 font-semibold text-gray-600">Tujuan</th>
                <th className="p-4 font-semibold text-gray-600">Tanggal</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Memuat data realtime...</td></tr>
              ) : logistik.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle className="text-gray-400 mb-2" size={32} />
                      <p>Belum ada data pengiriman aktif saat ini.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logistik.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-800">#TXN-{item.transaksi_id}</td>
                    <td className="p-4">
                      <p className="font-medium text-gray-800">{item.nama_produk}</p>
                      <p className="text-xs text-gray-500">Petani: {item.nama_petani}</p>
                    </td>
                    <td className="p-4 text-gray-700 font-medium">{item.nama_pembeli}</td>
                    <td className="p-4 text-gray-600 max-w-xs truncate" title={item.alamat_tujuan}>{item.alamat_tujuan}</td>
                    <td className="p-4 text-gray-500 text-sm">{formatTanggal(item.created_at)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}