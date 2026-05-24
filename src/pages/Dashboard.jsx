import { useEffect, useState } from 'react';
import { Package, Clock, Truck, CheckCircle, AlertTriangle } from 'lucide-react';
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
      // Mengambil data status pengiriman dan summary sesuai brief
      const response = await api.get('/logistik/status');
      
      if (response.data.success) {
        setLogistik(response.data.data || []);
        // Menyimpan data summary untuk ditampilkan di Card
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

  // Fungsi pembantu untuk warna badge pengiriman
  const getStatusColor = (status) => {
    switch (status) {
      case 'diproses': return 'bg-yellow-100 text-yellow-700';
      case 'dalam_perjalanan': return 'bg-blue-100 text-blue-700';
      case 'terkirim': return 'bg-green-100 text-green-700';
      case 'gagal': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Logistik</h1>
        <p className="text-gray-500 mt-1">Monitoring status pengiriman dan stok secara realtime</p>
      </div>

      {/* ========================================= */}
      {/* SUMMARY CARDS */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card Total */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-gray-600">
            <Package size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Pengiriman</p>
            <p className="text-2xl font-bold text-gray-800">{loading ? '...' : summary.total}</p>
          </div>
        </div>

        {/* Card Diproses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-yellow-50 rounded-lg text-yellow-600">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Sedang Diproses</p>
            <p className="text-2xl font-bold text-gray-800">{loading ? '...' : summary.diproses}</p>
          </div>
        </div>

        {/* Card Dalam Perjalanan */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-lg text-blue-600">
            <Truck size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Dalam Perjalanan</p>
            <p className="text-2xl font-bold text-gray-800">{loading ? '...' : summary.dalam_perjalanan}</p>
          </div>
        </div>

        {/* Card Terkirim */}
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

      {/* ========================================= */}
      {/* TABEL MONITORING PENGIRIMAN REALTIME */}
      {/* ========================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">Status Pengiriman Terbaru</h2>
          <button onClick={fetchDashboardData} className="text-sm text-green-600 hover:text-green-700 font-medium">
            Refresh Data
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600">ID Pengiriman</th>
                <th className="p-4 font-semibold text-gray-600">ID Transaksi</th>
                <th className="p-4 font-semibold text-gray-600">Kurir</th>
                <th className="p-4 font-semibold text-gray-600">Tujuan</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Memuat data realtime...</td></tr>
              ) : logistik.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 flex flex-col items-center justify-center">
                    <AlertTriangle className="text-gray-400 mb-2" size={32} />
                    Belum ada data pengiriman aktif saat ini.
                  </td>
                </tr>
              ) : (
                logistik.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">#SHP-{item.id}</td>
                    <td className="p-4 text-gray-600">#TXN-{item.transaksi_id}</td>
                    <td className="p-4 text-gray-600 font-medium">{item.kurir}</td>
                    <td className="p-4 text-gray-600 max-w-xs truncate" title={item.alamat_tujuan}>{item.alamat_tujuan}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ').toUpperCase()}
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