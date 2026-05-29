class ApiConfig {
  static const String baseUrl =
      'https://distribusi-panen-api-720084965883.us-central1.run.app';

  static Map<String, String> headers(String? token) {
    final h = <String, String>{
      'Content-Type': 'application/json',
    };
    if (token != null && token.isNotEmpty) {
      h['Authorization'] = 'Bearer $token';
    }
    return h;
  }
}
