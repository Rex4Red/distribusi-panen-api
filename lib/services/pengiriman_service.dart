import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/pengiriman.dart';

class PengirimanService {
  // POST /pengiriman
  Future<Pengiriman> create(String token, Map<String, dynamic> body) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/pengiriman'),
      headers: ApiConfig.headers(token),
      body: jsonEncode(body),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 201 && data['success'] == true) {
      return Pengiriman.fromJson(data['data']);
    }
    throw Exception(data['message'] ?? 'Gagal membuat pengiriman');
  }

  // GET /pengiriman/:id
  Future<Pengiriman> getById(String token, int id) async {
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/pengiriman/$id'),
      headers: ApiConfig.headers(token),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return Pengiriman.fromJson(data['data']);
    }
    throw Exception(data['message'] ?? 'Gagal mengambil pengiriman');
  }

  // PUT /pengiriman/:id/status
  Future<void> updateStatus(String token, int id, String status) async {
    final response = await http.put(
      Uri.parse('${ApiConfig.baseUrl}/pengiriman/$id/status'),
      headers: ApiConfig.headers(token),
      body: jsonEncode({'status': status}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode != 200 || data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal update status pengiriman');
    }
  }
}
