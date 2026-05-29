import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/transaksi.dart';

class TransaksiService {
  // POST /transaksi (pembeli create order)
  static Future<void> create({
    required String token,
    required int pembeliId,
    required int produkId,
    required double jumlahKg,
  }) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/transaksi'),
      headers: ApiConfig.headers(token),
      body: jsonEncode({
        'pembeli_id': pembeliId,
        'produk_id': produkId,
        'jumlah_kg': jumlahKg,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode != 201 || data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal membuat pesanan');
    }
  }

  // GET /transaksi
  Future<List<Transaksi>> getAll(String token) async {
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/transaksi'),
      headers: ApiConfig.headers(token),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return (data['data'] as List).map((e) => Transaksi.fromJson(e)).toList();
    }
    throw Exception(data['message'] ?? 'Gagal mengambil transaksi');
  }

  // GET /transaksi/:id
  Future<Transaksi> getById(String token, int id) async {
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/transaksi/$id'),
      headers: ApiConfig.headers(token),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return Transaksi.fromJson(data['data']);
    }
    throw Exception(data['message'] ?? 'Gagal mengambil detail transaksi');
  }

  // PUT /transaksi/:id  (update status)
  Future<void> updateStatus(String token, int id, String status) async {
    final response = await http.put(
      Uri.parse('${ApiConfig.baseUrl}/transaksi/$id'),
      headers: ApiConfig.headers(token),
      body: jsonEncode({'status': status}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode != 200 || data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal update status');
    }
  }

  // POST /pembayaran (pembeli bayar)
  Future<void> createPembayaran({
    required String token,
    required int transaksiId,
    required String metode,
    required double jumlah,
  }) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/pembayaran'),
      headers: ApiConfig.headers(token),
      body: jsonEncode({
        'transaksi_id': transaksiId,
        'metode': metode,
        'jumlah': jumlah,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode != 201 || data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal membuat pembayaran');
    }
  }
}
