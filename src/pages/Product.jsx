import { useEffect, useState } from 'react';
import { Search, Eye, CheckCircle, XCircle, X, Image as ImageIcon, ChevronLeft, ChevronRight, Info, Save } from 'lucide-react';
import api from '../api';

export default function Produk() {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [adminNote, setAdminNote] = useState('');
  
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    fetchProduk();
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Waktu tidak diketahui';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  const fetchProduk = async () => {
    try {
      setLoading(true);
      const response = await api.get('/produk'); 
      if (response.data.success) {
        setProduk(response.data.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data produk");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (item) => {
    setSelectedProduct(item);
    setActivePhotoIndex(0); 
    setAdminNote(item.catatan_admin || ''); 
    setIsReviewModalOpen(true);
  };

  // Fungsi untuk Tombol Setujui/Tolak
  const handleVerification = async (id, statusAksi) => {
    const statusDatabase = statusAksi === 'approved' ? 'tersedia' : 'ditolak';

    try {
      await api.put(`/produk/${id}`, { 
        status: statusDatabase,
        catatan_admin: adminNote 
      });
      
      setIsReviewModalOpen(false);
      fetchProduk(); 
      alert(`Produk berhasil diupdate menjadi: ${statusDatabase}!`);
      
    } catch (error) {
      console.warn("Backend error, mode preview aktif.");
      const updatedProduk = produk.map(p => 
        p.id === id ? { 
          ...p, 
          status: statusDatabase, 
          catatan_admin: adminNote, 
          verified_at: new Date().toISOString() 
        } : p
      );
      setProduk(updatedProduk);
      setIsReviewModalOpen(false);
      alert(`(Mode Preview) Produk menjadi: ${statusDatabase}!`);
    }
  };

  // ==========================================
  // FUNGSI BARU: UPDATE CATATAN SAJA
  // ==========================================
  const handleUpdateNote = async () => {
    try {
      // Kirim status yang sama seperti sebelumnya, tapi catatannya baru
      await api.put(`/produk/${selectedProduct.id}`, { 
        status: selectedProduct.status,
        catatan_admin: adminNote 
      });
      
      fetchProduk();
      // Update local state agar tombol "Simpan" menghilang setelah ditekan
      setSelectedProduct(prev => ({ ...prev, catatan_admin: adminNote }));
      alert('Catatan berhasil diperbarui!');
      
    } catch (error) {
      // Fallback Mode Preview
      const updatedProduk = produk.map(p => 
        p.id === selectedProduct.id ? { ...p, catatan_admin: adminNote } : p
      );
      setProduk(updatedProduk);
      setSelectedProduct(prev => ({ ...prev, catatan_admin: adminNote }));
      alert('(Mode Preview) Catatan berhasil diperbarui!');
    }
  };

  const getProductPhotos = (product) => {
    if (!product || !product.foto_urls) return [];
    if (Array.isArray(product.foto_urls)) return product.foto_urls;
    if (typeof product.foto_urls === 'string' && product.foto_urls.startsWith('[')) {
      try { return JSON.parse(product.foto_urls); } catch (e) { return [product.foto_urls]; }
    }
    return [product.foto_urls]; 
  };

  const currentPhotos = getProductPhotos(selectedProduct);

  const handlePrevPhoto = () => setActivePhotoIndex(prevIdx => (prevIdx === 0 ? currentPhotos.length - 1 : prevIdx - 1));
  const handleNextPhoto = () => setActivePhotoIndex(prevIdx => (prevIdx === currentPhotos.length - 1 ? 0 : prevIdx + 1));

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (currentPhotos.length <= 1) return;
    if (touchStart - touchEnd > 50) handleNextPhoto();
    if (touchStart - touchEnd < -50) handlePrevPhoto();
  };

  const renderStatusLabel = (status) => {
    const currentStatus = status ? status.toLowerCase() : 'menunggu_verifikasi'; 

    if (currentStatus === 'tersedia') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">Disetujui</span>;
    if (currentStatus === 'ditolak') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Ditolak</span>;
    if (currentStatus === 'habis') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">Habis</span>;
    if (currentStatus === 'nonaktif') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">Nonaktif</span>;
    
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">Pending</span>;
  };

  const getHistoryStatusProps = (status) => {
    switch (status) {
      case 'tersedia': return { text: 'Produk ini telah Disetujui', icon: <CheckCircle size={24} />, bg: 'bg-green-100', textCol: 'text-green-600' };
      case 'ditolak': return { text: 'Produk ini telah Ditolak', icon: <XCircle size={24} />, bg: 'bg-red-100', textCol: 'text-red-600' };
      case 'nonaktif': return { text: 'Produk telah dinonaktifkan oleh petani', icon: <Info size={24} />, bg: 'bg-gray-100', textCol: 'text-gray-600' };
      case 'habis': return { text: 'Produk telah habis', icon: <Info size={24} />, bg: 'bg-gray-100', textCol: 'text-gray-600' };
      default: return { text: 'Status tidak diketahui', icon: <Info size={24} />, bg: 'bg-gray-100', textCol: 'text-gray-600' };
    }
  };

  // Cek apakah admin sedang mengubah catatan aslinya
  const isNoteChanged = selectedProduct && adminNote !== (selectedProduct.catatan_admin || '');

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Review & Verifikasi Produk Panen</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-72">
          <input 
            type="text" 
            placeholder="Cari nama produk atau petani..." 
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
                <th className="p-4 font-semibold text-gray-600">Produk</th>
                <th className="p-4 font-semibold text-gray-600">Kategori</th>
                <th className="p-4 font-semibold text-gray-600">Petani Pengirim</th>
                <th className="p-4 font-semibold text-gray-600">Harga / Kg</th>
                <th className="p-4 font-semibold text-gray-600">Stok</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : produk.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">Belum ada produk yang perlu diverifikasi.</td></tr>
              ) : (
                produk
                  .filter((item) => item !== null && item !== undefined) 
                  .map((item) => (
                  <tr key={item?.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{item?.nama_produk || '-'}</td>
                    <td className="p-4 text-gray-600">{item?.kategori || '-'}</td>
                    <td className="p-4 text-gray-600 font-medium">{item?.nama_petani || 'Anonim'}</td>
                    <td className="p-4 text-gray-600">
                      Rp {Number(item?.harga_per_kg || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-gray-600">{item?.stok_kg || 0} kg</td>
                    <td className="p-4">{renderStatusLabel(item?.status)}</td>
                    <td className="p-4 flex justify-center">
                      <button 
                        onClick={() => handleReviewClick(item)}
                        className="flex items-center gap-2 px-4 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-semibold"
                      >
                        <Eye size={16} /> Review Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REVIEW & VERIFIKASI PRODUK */}
      {isReviewModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-800">Verifikasi Produk Petani</h2>
                {renderStatusLabel(selectedProduct.status)}
              </div>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* BAGIAN KIRI: GALERI FOTO SLIDER */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-700">Foto Produk ({currentPhotos.length}):</p>
                  
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                       onTouchStart={handleTouchStart}
                       onTouchMove={handleTouchMove}
                       onTouchEnd={handleTouchEnd}>
                    {currentPhotos.length > 0 ? (
                      <>
                        <div 
                          className="flex h-full w-full transition-transform duration-300 ease-out"
                          style={{ transform: `translateX(-${activePhotoIndex * 100}%)` }}
                        >
                          {currentPhotos.map((url, idx) => (
                            <div key={idx} className="shrink-0 w-full h-full flex items-center justify-center bg-gray-50">
                              <img src={url} alt={`Foto ${idx+1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                        {currentPhotos.length > 1 && (
                          <>
                            <button onClick={handlePrevPhoto} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/70 hover:bg-white/90 rounded-full shadow-md z-10"><ChevronLeft size={24} /></button>
                            <button onClick={handleNextPhoto} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/70 hover:bg-white/90 rounded-full shadow-md z-10"><ChevronRight size={24} /></button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <ImageIcon size={48} className="mb-2 opacity-50" />
                        <span className="text-sm">Tidak ada foto</span>
                      </div>
                    )}
                  </div>

                  {currentPhotos.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x snap-mandatory">
                      {currentPhotos.map((url, idx) => (
                        <button key={idx} onClick={() => setActivePhotoIndex(idx)} className={`shrink-0 snap-start w-16 h-16 rounded-md overflow-hidden border-2 ${activePhotoIndex === idx ? 'border-green-600 ring-2' : 'border-gray-200'}`}>
                          <img src={url} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* BAGIAN KANAN: DETAIL INFORMASI */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{selectedProduct.nama_produk}</h3>
                    <span className="inline-block px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-md mt-1">
                      {selectedProduct.kategori}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Petani Pengirim</p>
                      <p className="font-medium text-gray-800 text-lg">{selectedProduct.nama_petani || 'Anonim'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Harga Jual / Kg</p>
                        <p className="font-bold text-green-600 text-xl">
                          Rp {Number(selectedProduct.harga_per_kg).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Kapasitas Stok</p>
                        <p className="font-bold text-gray-800 text-xl">{selectedProduct.stok_kg} Kg</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Catatan Tambahan / Deskripsi</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-20 leading-relaxed">
                      {selectedProduct.deskripsi || 'Petani tidak memberikan deskripsi tambahan.'}
                    </p>
                  </div>

                  {/* FORM CATATAN ADMIN (SELALU BISA DIKETIK) */}
                  <div className="pt-2">
                    <p className="text-xs text-blue-600 uppercase font-bold mb-2 flex items-center gap-1">
                      <Info size={14} /> Catatan Admin (Internal)
                    </p>
                    
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Tambahkan atau edit catatan di sini..."
                      className="w-full px-4 py-3 border border-blue-200 bg-blue-50/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                      rows="3"
                    />

                    {/* Munculkan Tombol Simpan HANYA JIKA ada perubahan pada ketikan DAN status BUKAN pending */}
                    {selectedProduct.status && selectedProduct.status !== 'menunggu_verifikasi' && isNoteChanged && (
                      <div className="flex justify-end mt-2">
                        <button 
                          onClick={handleUpdateNote}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                        >
                          <Save size={16} /> Simpan Perubahan Catatan
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* Bagian Bawah: Tombol Aksi ATAU Info Verifikasi Dinamis */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 sticky bottom-0">
              {(!selectedProduct.status || selectedProduct.status === 'menunggu_verifikasi') ? (
                <div className="flex justify-end gap-3">
                  <button onClick={() => handleVerification(selectedProduct.id, 'rejected')} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition-colors">
                    <XCircle size={18} /> Tolak Produk
                  </button>
                  <button onClick={() => handleVerification(selectedProduct.id, 'approved')} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white hover:bg-green-700 font-semibold rounded-lg shadow-sm transition-colors">
                    <CheckCircle size={18} /> Setujui & Tayangkan
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getHistoryStatusProps(selectedProduct.status).bg} ${getHistoryStatusProps(selectedProduct.status).textCol}`}>
                      {getHistoryStatusProps(selectedProduct.status).icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {getHistoryStatusProps(selectedProduct.status).text}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Pada: {formatDateTime(selectedProduct.verified_at || selectedProduct.updated_at)}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setIsReviewModalOpen(false)} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors">
                    Tutup Review
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}