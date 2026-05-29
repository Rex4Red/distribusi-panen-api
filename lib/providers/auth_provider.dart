import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();

  User? _user;
  String? _token;
  bool _isLoading = false;

  User? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isLoggedIn => _token != null;
  int? get petaniId => _user?.petani?.id;
  String? get role => _user?.role;

  // Check saved token on app start
  Future<bool> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    final savedToken = prefs.getString('token');
    if (savedToken == null) return false;

    try {
      _token = savedToken;
      _user = await _authService.getProfile(savedToken);
      notifyListeners();
      return true;
    } catch (_) {
      await logout();
      return false;
    }
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final data = await _authService.login(email, password);
      _token = data['token'];
      _user = User.fromJson(data['user']);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', _token!);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> register({
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
    _isLoading = true;
    notifyListeners();

    try {
      final data = await _authService.register(
        nama: nama,
        email: email,
        password: password,
        role: role,
        phone: phone,
        alamat: alamat,
        namaUsaha: namaUsaha,
        lokasi: lokasi,
        luasLahan: luasLahan,
        jenisTanaman: jenisTanaman,
        namaBisnis: namaBisnis,
        tipe: tipe,
        alamatBisnis: alamatBisnis,
      );
      _token = data['token'];
      _user = User.fromJson(data['user']);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', _token!);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refreshProfile() async {
    if (_token == null) return;
    _user = await _authService.getProfile(_token!);
    notifyListeners();
  }

  Future<void> updateProfile(Map<String, dynamic> body) async {
    if (_token == null) return;
    _user = await _authService.updateProfile(_token!, body);
    notifyListeners();
  }

  Future<void> logout() async {
    _user = null;
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    notifyListeners();
  }
}
