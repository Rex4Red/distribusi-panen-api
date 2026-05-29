class User {
  final int id;
  final String nama;
  final String email;
  final String role;
  final String? phone;
  final String? alamat;
  final PetaniProfile? petani;
  final PembeliProfile? pembeli;

  User({
    required this.id,
    required this.nama,
    required this.email,
    required this.role,
    this.phone,
    this.alamat,
    this.petani,
    this.pembeli,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? 0,
      nama: json['nama'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'petani',
      phone: json['phone'],
      alamat: json['alamat'],
      petani: json['petani'] != null
          ? PetaniProfile.fromJson(json['petani'])
          : null,
      pembeli: json['pembeli'] != null
          ? PembeliProfile.fromJson(json['pembeli'])
          : null,
    );
  }
}

class PetaniProfile {
  final int id;
  final int userId;
  final String? namaUsaha;
  final String? lokasi;
  final double? luasLahan;
  final String? jenisTanaman;
  final double? rating;

  PetaniProfile({
    required this.id,
    required this.userId,
    this.namaUsaha,
    this.lokasi,
    this.luasLahan,
    this.jenisTanaman,
    this.rating,
  });

  factory PetaniProfile.fromJson(Map<String, dynamic> json) {
    return PetaniProfile(
      id: json['id'] ?? 0,
      userId: json['user_id'] ?? 0,
      namaUsaha: json['nama_usaha'],
      lokasi: json['lokasi'],
      luasLahan: json['luas_lahan'] != null
          ? double.tryParse(json['luas_lahan'].toString())
          : null,
      jenisTanaman: json['jenis_tanaman'],
      rating: json['rating'] != null
          ? double.tryParse(json['rating'].toString())
          : null,
    );
  }
}

class PembeliProfile {
  final int id;
  final int userId;
  final String? namaBisnis;
  final String? tipe;
  final String? alamatBisnis;

  PembeliProfile({
    required this.id,
    required this.userId,
    this.namaBisnis,
    this.tipe,
    this.alamatBisnis,
  });

  factory PembeliProfile.fromJson(Map<String, dynamic> json) {
    return PembeliProfile(
      id: json['id'] ?? 0,
      userId: json['user_id'] ?? 0,
      namaBisnis: json['nama_bisnis'],
      tipe: json['tipe'],
      alamatBisnis: json['alamat_bisnis'],
    );
  }
}
