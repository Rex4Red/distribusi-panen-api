import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class StokService {
  // GET /stok-realtime
  Future<List<Map<String, dynamic>>> getAll(String token) async {
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/stok-realtime'),
      headers: ApiConfig.headers(token),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return List<Map<String, dynamic>>.from(data['data']);
    }
    throw Exception(data['message'] ?? 'Gagal mengambil stok realtime');
  }

  // PUT /stok-realtime/:id
  Future<void> update(String token, String id, Map<String, dynamic> body) async {
    final response = await http.put(
      Uri.parse('${ApiConfig.baseUrl}/stok-realtime/$id'),
      headers: ApiConfig.headers(token),
      body: jsonEncode(body),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode != 200 || data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal update stok');
    }
  }

  // GET /notifikasi
  Future<List<Map<String, dynamic>>> getNotifikasi(String token) async {
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/notifikasi'),
      headers: ApiConfig.headers(token),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return List<Map<String, dynamic>>.from(data['data']);
    }
    throw Exception(data['message'] ?? 'Gagal mengambil notifikasi');
  }

  // GET /logistik/status
  Future<Map<String, dynamic>> getLogistikDashboard(String token) async {
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/logistik/status'),
      headers: ApiConfig.headers(token),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    }
    throw Exception(data['message'] ?? 'Gagal mengambil dashboard logistik');
  }
}
