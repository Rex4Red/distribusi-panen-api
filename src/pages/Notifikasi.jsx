import { useEffect, useState } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import api from '../api';

export default function Notifikasi() {
  const [notifikasi, setNotifikasi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifikasi();
  }, []);

  const fetchNotifikasi = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifikasi'); //
      if (response.data.success) {
        setNotifikasi(response.data.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data notifikasi");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menampilkan ikon berdasarkan tipe notifikasi
  const getIcon = (tipe) => {
    switch (tipe) {
      case 'success': return <CheckCircle className="text-green-500" size={24} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={24} />;
      case 'info': default: return <Info className="text-blue-500" size={24} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <Bell className="text-green-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-800">Notifikasi Sistem</h1>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center p-10 text-gray-500">Memuat notifikasi...</div>
        ) : notifikasi.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
            Belum ada notifikasi baru saat ini.
          </div>
        ) : (
          notifikasi.map((item, index) => (
            <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-start hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-gray-50 rounded-full shrink-0">
                {getIcon(item.tipe)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{item.judul}</h3>
                <p className="text-gray-600 mt-1">{item.pesan}</p>
                <div className="flex items-center gap-1 mt-3 text-sm text-gray-400">
                  <Clock size={14} />
                  <span>{item.waktu}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}