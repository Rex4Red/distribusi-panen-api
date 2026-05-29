import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import '../config/api_config.dart';
import '../models/produk.dart';

class ProdukService {
  // GET /produk
  Future<List<Produk>> getAll(String token, {String? search, String? kategori}) async {
    final params = <String, String>{};
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (kategori != null && kategori.isNotEmpty) params['kategori'] = kategori;

    final uri = Uri.parse('${ApiConfig.baseUrl}/produk')
        .replace(queryParameters: params.isNotEmpty ? params : null);

    final response = await http.get(uri, headers: ApiConfig.headers(token));
    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return (data['data'] as List).map((e) => Produk.fromJson(e)).toList();
    }
    throw Exception(data['message'] ?? 'Gagal mengambil produk');
  }

  // POST /produk — multipart with photos
  Future<Produk> create(String token, Map<String, dynamic> body, {List<File>? photos}) async {
    if (photos != null && photos.isNotEmpty) {
      // Use multipart upload
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('${ApiConfig.baseUrl}/produk'),
      );
      request.headers['Authorization'] = 'Bearer $token';

      // Add text fields
      body.forEach((key, value) {
        if (value != null) request.fields[key] = value.toString();
      });

      // Add photo files
      for (final file in photos) {
        final ext = file.path.split('.').last.toLowerCase();
        final mime = ext == 'png' ? 'image/png' : 'image/jpeg';
        request.files.add(
          await http.MultipartFile.fromPath(
            'foto',
            file.path,
            contentType: MediaType.parse(mime),
          ),
        );
      }

      final streamedResponse = await request.send();
      final responseBody = await streamedResponse.stream.bytesToString();
      final data = jsonDecode(responseBody);

      if (streamedResponse.statusCode == 201 && data['success'] == true) {
        return Produk.fromJson(data['data']);
      }
      throw Exception(data['message'] ?? 'Gagal membuat produk');
    } else {
      // JSON-only (no photos)
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/produk'),
        headers: ApiConfig.headers(token),
        body: jsonEncode(body),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 201 && data['success'] == true) {
        return Produk.fromJson(data['data']);
      }
      throw Exception(data['message'] ?? 'Gagal membuat produk');
    }
  }

  // PUT /produk/:id
  Future<Produk> update(String token, int id, Map<String, dynamic> body) async {
    final response = await http.put(
      Uri.parse('${ApiConfig.baseUrl}/produk/$id'),
      headers: ApiConfig.headers(token),
      body: jsonEncode(body),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return Produk.fromJson(data['data']);
    }
    throw Exception(data['message'] ?? 'Gagal update produk');
  }

  // DELETE /produk/:id
  Future<void> delete(String token, int id) async {
    final response = await http.delete(
      Uri.parse('${ApiConfig.baseUrl}/produk/$id'),
      headers: ApiConfig.headers(token),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode != 200 || data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal hapus produk');
    }
  }
}
