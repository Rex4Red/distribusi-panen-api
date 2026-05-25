import { useEffect, useState } from 'react';
// Tambah ikon ChevronLeft & ChevronRight untuk tombol slider
import { Search, Eye, CheckCircle, XCircle, X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';

export default function Produk() {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // State untuk Modal Review / Verifikasi
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // State untuk melacak indeks foto yang sedang dilihat di modal
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // State untuk melacak geseran jari (touch swiping)
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    fetchProduk();
  }, []);

  const fetchProduk = async () => {
    try {
      setLoading(true);
      const response = await api.get('/produk'); 
      if (response.data.success) {
        setProduk(response.data.data || []);
        // console.log("Data Asli Backend:", response.data.data); 
      }
    } catch (error) {
      console.error("Gagal mengambil data produk");
    } finally {
      setLoading(false);
    }
  };

  // Membuka modal dan menyimpan data produk yang ingin direview
  const handleReviewClick = (item) => {
    setSelectedProduct(item);
    setActivePhotoIndex(0); // Reset ke foto pertama setiap kali buka modal
    setIsReviewModalOpen(true);
  };

  // Fungsi aksi verifikasi (Terima/Tolak)
  const handleVerification = async (id, status) => {
    try {
      // Contoh endpoint untuk update status verifikasi
      // await api.put(`/produk/${id}/verifikasi`, { status: status });
      
      setIsReviewModalOpen(false);
      // fetchProduk(); // Refresh data setelah aksi
      alert(`Produk berhasil di-${status === 'approved' ? 'setujui' : 'tolak'}!`);
    } catch (error) {
      alert('Gagal memproses verifikasi.');
    }
  };

  // Fungsi utilitas untuk memastikan format foto selalu berupa Array
  // Menggunakan properti "foto_url" sesuai backend Anda
  const getProductPhotos = (product) => {
    if (!product) return [];
    // Prioritas 1: foto_urls array dari Firestore (via API merge)
    if (product.foto_urls && Array.isArray(product.foto_urls) && product.foto_urls.length > 0) {
      return product.foto_urls;
    }
    // Prioritas 2: foto_url string dari MySQL
    if (!product.foto_url) return [];
    if (Array.isArray(product.foto_url)) return product.foto_url;
    if (typeof product.foto_url === 'string' && product.foto_url.startsWith('[')) {
      try { return JSON.parse(product.foto_url); } catch (e) { return [product.foto_url]; }
    }
    return [product.foto_url];
  };

  // Mengambil daftar foto untuk produk yang sedang dipilih
  const currentPhotos = getProductPhotos(selectedProduct);

  // Fungsi Navigasi Slider (Prev & Next)
  const handlePrevPhoto = () => {
    setActivePhotoIndex(prevIdx => (prevIdx === 0 ? currentPhotos.length - 1 : prevIdx - 1));
  };

  const handleNextPhoto = () => {
    setActivePhotoIndex(prevIdx => (prevIdx === currentPhotos.length - 1 ? 0 : prevIdx + 1));
  };

  // Handler untuk Geseran Jari (Touch Swiping)
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    // Abaikan jika hanya ada 1 foto
    if (currentPhotos.length <= 1) return;

    // Geser ke kiri (Swipe Left) -> Tampilkan Foto Berikutnya
    if (touchStart - touchEnd > 50) {
      handleNextPhoto();
    }

    // Geser ke kanan (Swipe Right) -> Tampilkan Foto Sebelumnya
    if (touchStart - touchEnd < -50) {
      handlePrevPhoto();
    }
  };

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
                <th className="p-4 font-semibold text-gray-600">Produk</th>
                <th className="p-4 font-semibold text-gray-600">Kategori</th>
                <th className="p-4 font-semibold text-gray-600">Petani Pengirim</th>
                <th className="p-4 font-semibold text-gray-600">Harga / Kg</th>
                <th className="p-4 font-semibold text-gray-600">Stok</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Aksi (Review)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : produk.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Belum ada produk yang perlu diverifikasi.</td></tr>
              ) : (
                produk.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{item.nama_produk}</td>
                    <td className="p-4 text-gray-600">{item.kategori}</td>
                    <td className="p-4 text-gray-600 font-medium">{item.nama_petani || 'Nama Petani'}</td>
                    {/* Menggunakan harga_per_kg */}
                    <td className="p-4 text-gray-600">
                      Rp {Number(item.harga_per_kg).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-gray-600">{item.stok_kg} kg</td>
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

      {/* ========================================= */}
      {/* MODAL REVIEW & VERIFIKASI PRODUK */}
      {/* ========================================= */}
      {isReviewModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">Verifikasi Produk Petani</h2>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* BAGIAN KIRI: GALERI FOTO SLIDER */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-700">Foto Produk ({currentPhotos.length}):</p>
                  
                  {/* Container Slider Utama */}
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                       onTouchStart={handleTouchStart}
                       onTouchMove={handleTouchMove}
                       onTouchEnd={handleTouchEnd}>
                    
                    {currentPhotos.length > 0 ? (
                      <>
                        {/* Slider Track ( Container yang benar-benar bergeser ) */}
                        <div 
                          className="flex h-full w-full transition-transform duration-300 ease-out"
                          style={{ transform: `translateX(-${activePhotoIndex * 100}%)` }}
                        >
                          {currentPhotos.map((url, idx) => (
                            <div key={idx} className="shrink-0 w-full h-full flex items-center justify-center bg-gray-50">
                              <img 
                                src={url} 
                                alt={`Foto ${idx+1}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Tombol Navigasi (Prev/Next) */}
                        {currentPhotos.length > 1 && (
                          <>
                            <button 
                              onClick={handlePrevPhoto}
                              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/70 hover:bg-white/90 rounded-full text-gray-700 shadow-md transition-colors z-10"
                            >
                              <ChevronLeft size={24} />
                            </button>
                            <button 
                              onClick={handleNextPhoto}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/70 hover:bg-white/90 rounded-full text-gray-700 shadow-md transition-colors z-10"
                            >
                              <ChevronRight size={24} />
                            </button>
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

                  {/* Thumbnail / Foto-foto Kecil (Indikator & Navigasi Cepat) */}
                  {currentPhotos.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x snap-mandatory">
                      {currentPhotos.map((url, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActivePhotoIndex(idx)}
                          className={`shrink-0 snap-start w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                            activePhotoIndex === idx ? 'border-green-600 ring-2 ring-green-200' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img src={url} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bagian Kanan: Detail Informasi */}
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
                        {/* Menggunakan harga_per_kg */}
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
                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-25 leading-relaxed">
                      {selectedProduct.deskripsi || 'Petani tidak memberikan deskripsi tambahan.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian Bawah: Tombol Aksi Verifikasi */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 sticky bottom-0">
              <button 
                onClick={() => handleVerification(selectedProduct.id, 'rejected')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition-colors"
              >
                <XCircle size={18} /> Tolak Produk
              </button>
              
              <button 
                onClick={() => handleVerification(selectedProduct.id, 'approved')}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white hover:bg-green-700 font-semibold rounded-lg shadow-sm transition-colors"
              >
                <CheckCircle size={18} /> Setujui & Tayangkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}