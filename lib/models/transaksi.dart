class Transaksi {
  final int id;
  final int pembeliId;
  final int petaniId;
  final int produkId;
  final double jumlahKg;
  final double totalHarga;
  final String status;
  final String? createdAt;
  final String? namaPembeli;
  final String? namaProduk;
  final String? namaPetani;

  // Pembayaran fields (from LEFT JOIN)
  final int? pembayaranId;
  final String? metode;
  final double? jumlahPembayaran;
  final String? statusPembayaran;
  final String? buktiBayarUrl;

  Transaksi({
    required this.id,
    required this.pembeliId,
    required this.petaniId,
    required this.produkId,
    required this.jumlahKg,
    required this.totalHarga,
    required this.status,
    this.createdAt,
    this.namaPembeli,
    this.namaProduk,
    this.namaPetani,
    this.pembayaranId,
    this.metode,
    this.jumlahPembayaran,
    this.statusPembayaran,
    this.buktiBayarUrl,
  });

  /// Apakah transaksi sudah dibayar
  bool get sudahBayar => pembayaranId != null;

  /// Apakah pembeli perlu bayar (dikonfirmasi petani tapi belum bayar)
  bool get perluBayar => status == 'dikonfirmasi' && !sudahBayar;

  factory Transaksi.fromJson(Map<String, dynamic> json) {
    return Transaksi(
      id: json['id'] ?? 0,
      pembeliId: json['pembeli_id'] ?? 0,
      petaniId: json['petani_id'] ?? 0,
      produkId: json['produk_id'] ?? 0,
      jumlahKg: double.tryParse(json['jumlah_kg'].toString()) ?? 0,
      totalHarga: double.tryParse(json['total_harga'].toString()) ?? 0,
      status: json['status'] ?? 'pending',
      createdAt: json['created_at'],
      namaPembeli: json['nama_pembeli'],
      namaProduk: json['nama_produk'],
      namaPetani: json['nama_petani'],
      pembayaranId: json['pembayaran_id'],
      metode: json['metode'],
      jumlahPembayaran: json['jumlah_pembayaran'] != null
          ? double.tryParse(json['jumlah_pembayaran'].toString())
          : null,
      statusPembayaran: json['status_pembayaran'],
      buktiBayarUrl: json['bukti_bayar_url'],
    );
  }
}
