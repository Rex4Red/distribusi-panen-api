class Pengiriman {
  final int id;
  final int transaksiId;
  final String alamatAsal;
  final String alamatTujuan;
  final String? kurir;
  final String? estimasi;
  final String status;
  final String? createdAt;

  Pengiriman({
    required this.id,
    required this.transaksiId,
    required this.alamatAsal,
    required this.alamatTujuan,
    this.kurir,
    this.estimasi,
    required this.status,
    this.createdAt,
  });

  factory Pengiriman.fromJson(Map<String, dynamic> json) {
    return Pengiriman(
      id: json['id'] ?? 0,
      transaksiId: json['transaksi_id'] ?? 0,
      alamatAsal: json['alamat_asal'] ?? '',
      alamatTujuan: json['alamat_tujuan'] ?? '',
      kurir: json['kurir'],
      estimasi: json['estimasi'],
      status: json['status'] ?? 'diproses',
      createdAt: json['created_at'],
    );
  }
}
