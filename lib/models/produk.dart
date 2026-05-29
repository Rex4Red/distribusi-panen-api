class Produk {
  final int id;
  final int petaniId;
  final String namaProduk;
  final String? kategori;
  final double hargaPerKg;
  final double stokKg;
  final String? deskripsi;
  final List<String> fotoUrls;
  final String status;
  final String? catatanAdmin;
  final String? verifiedAt;
  final String? namaPetani;
  final String? namaUsaha;
  final String? lokasi;
  final String? createdAt;

  Produk({
    required this.id,
    required this.petaniId,
    required this.namaProduk,
    this.kategori,
    required this.hargaPerKg,
    required this.stokKg,
    this.deskripsi,
    this.fotoUrls = const [],
    required this.status,
    this.catatanAdmin,
    this.verifiedAt,
    this.namaPetani,
    this.namaUsaha,
    this.lokasi,
    this.createdAt,
  });

  factory Produk.fromJson(Map<String, dynamic> json) {
    // Handle foto_urls: can be a list or null; also support legacy foto_url string
    List<String> parseFotos() {
      if (json['foto_urls'] != null && json['foto_urls'] is List) {
        return List<String>.from(json['foto_urls']);
      }
      if (json['foto_url'] != null && json['foto_url'].toString().isNotEmpty) {
        return [json['foto_url'].toString()];
      }
      return [];
    }

    return Produk(
      id: int.tryParse(json['id'].toString()) ?? 0,
      petaniId: int.tryParse(json['petani_id'].toString()) ?? 0,
      namaProduk: json['nama_produk']?.toString() ?? '',
      kategori: json['kategori']?.toString(),
      hargaPerKg: double.tryParse(json['harga_per_kg'].toString()) ?? 0,
      stokKg: double.tryParse(json['stok_kg'].toString()) ?? 0,
      deskripsi: json['deskripsi']?.toString(),
      fotoUrls: parseFotos(),
      status: json['status']?.toString() ?? 'tersedia',
      catatanAdmin: json['catatan_admin']?.toString(),
      verifiedAt: json['verified_at']?.toString(),
      namaPetani: json['nama_petani']?.toString(),
      namaUsaha: json['nama_usaha']?.toString(),
      lokasi: json['lokasi']?.toString(),
      createdAt: json['created_at']?.toString(),
    );
  }
}
