import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/user.dart';

class AuthService {
  // POST /auth/login
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/auth/login'),
      headers: ApiConfig.headers(null),
      body: jsonEncode({'email': email, 'password': password}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return data['data'];
    }
    throw Exception(data['message'] ?? 'Login gagal');
  }

  // POST /auth/register
  Future<Map<String, dynamic>> register({
    required String nama,
    required String email,
    required String password,
    required String role,
    String? phone,
    String? alamat,
    // Petani fields
    String? namaUsaha,
    String? lokasi,
    double? luasLahan,
    String? jenisTanaman,
    // Pembeli fields
    String? namaBisnis,
    String? tipe,
    String? alamatBisnis,
  }) async {
    final body = <String, dynamic>{
      'nama': nama,
      'email': email,
      'password': password,
      'role': role,
    };
    if (phone != null) body['phone'] = phone;
    if (alamat != null) body['alamat'] = alamat;
    // Petani fields
    if (namaUsaha != null) body['nama_usaha'] = namaUsaha;
    if (lokasi != null) body['lokasi'] = lokasi;
    if (luasLahan != null) body['luas_lahan'] = luasLahan;
    if (jenisTanaman != null) body['jenis_tanaman'] = jenisTanaman;
    // Pembeli fields
    if (namaBisnis != null) body['nama_bisnis'] = namaBisnis;
    if (tipe != null) body['tipe'] = tipe;
    if (alamatBisnis != null) body['alamat_bisnis'] = alamatBisnis;

    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/auth/register'),
      headers: ApiConfig.headers(null),
      body: jsonEncode(body),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 201 && data['success'] == true) {
      return data['data'];
    }
    throw Exception(data['message'] ?? 'Register gagal');
  }

  // GET /auth/profile
  Future<User> getProfile(String token) async {
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/auth/profile'),
      headers: ApiConfig.headers(token),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return User.fromJson(data['data']);
    }
    throw Exception(data['message'] ?? 'Gagal mengambil profil');
  }

  // PUT /auth/profile
  Future<User> updateProfile(String token, Map<String, dynamic> body) async {
    final response = await http.put(
      Uri.parse('${ApiConfig.baseUrl}/auth/profile'),
      headers: ApiConfig.headers(token),
      body: jsonEncode(body),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return User.fromJson(data['data']);
    }
    throw Exception(data['message'] ?? 'Gagal update profil');
  }
}
