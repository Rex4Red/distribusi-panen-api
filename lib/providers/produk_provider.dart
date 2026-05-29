import 'dart:io';
import 'package:flutter/material.dart';
import '../models/produk.dart';
import '../services/produk_service.dart';

class ProdukProvider with ChangeNotifier {
  final ProdukService _produkService = ProdukService();

  List<Produk> _produkList = [];
  bool _isLoading = false;
  String? _error;

  List<Produk> get produkList => _produkList;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchProduk(String token, {String? search, String? kategori}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _produkList = await _produkService.getAll(token, search: search, kategori: kategori);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Filter produk by petani_id (client-side)
  List<Produk> getProdukByPetani(int petaniId) {
    return _produkList.where((p) => p.petaniId == petaniId).toList();
  }

  Future<Produk> createProduk(String token, Map<String, dynamic> body, {List<File>? photos}) async {
    final produk = await _produkService.create(token, body, photos: photos);
    _produkList.insert(0, produk);
    notifyListeners();
    return produk;
  }

  Future<void> updateProduk(String token, int id, Map<String, dynamic> body) async {
    final updated = await _produkService.update(token, id, body);
    final index = _produkList.indexWhere((p) => p.id == id);
    if (index != -1) {
      _produkList[index] = updated;
      notifyListeners();
    }
  }

  Future<void> deleteProduk(String token, int id) async {
    await _produkService.delete(token, id);
    _produkList.removeWhere((p) => p.id == id);
    notifyListeners();
  }
}
