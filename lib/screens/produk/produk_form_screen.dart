import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/produk_provider.dart';
import '../../models/produk.dart';

class ProdukFormScreen extends StatefulWidget {
  final Produk? produk;
  const ProdukFormScreen({super.key, this.produk});
  @override
  State<ProdukFormScreen> createState() => _ProdukFormScreenState();
}

class _ProdukFormScreenState extends State<ProdukFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _namaC, _kategoriC, _hargaC, _stokC, _deskripsiC;
  String _status = 'tersedia';
  bool _loading = false;
  bool get _isEdit => widget.produk != null;

  final List<File> _selectedPhotos = [];
  final _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    final p = widget.produk;
    _namaC = TextEditingController(text: p?.namaProduk ?? '');
    _kategoriC = TextEditingController(text: p?.kategori ?? '');
    _hargaC = TextEditingController(text: p != null ? p.hargaPerKg.toStringAsFixed(0) : '');
    _stokC = TextEditingController(text: p != null ? p.stokKg.toStringAsFixed(0) : '');
    _deskripsiC = TextEditingController(text: p?.deskripsi ?? '');
    if (p != null) _status = p.status;
  }

  @override
  void dispose() {
    _namaC.dispose();
    _kategoriC.dispose();
    _hargaC.dispose();
    _stokC.dispose();
    _deskripsiC.dispose();
    super.dispose();
  }

  Future<void> _pickPhotos() async {
    if (_selectedPhotos.length >= 3) {
      _showSnack('Maksimal 3 foto', Colors.orange);
      return;
    }

    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),
              const Text('Pilih Sumber Foto',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.camera_alt, color: Color(0xFF2E7D32)),
                ),
                title: const Text('Kamera'),
                subtitle: const Text('Ambil foto baru'),
                onTap: () => Navigator.pop(context, ImageSource.camera),
              ),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.photo_library, color: Color(0xFF2E7D32)),
                ),
                title: const Text('Galeri'),
                subtitle: const Text('Pilih dari galeri'),
                onTap: () => Navigator.pop(context, ImageSource.gallery),
              ),
            ],
          ),
        ),
      ),
    );

    if (source == null) return;

    try {
      if (source == ImageSource.gallery) {
        final remaining = 3 - _selectedPhotos.length;
        final picked = await _picker.pickMultiImage(
          maxWidth: 1200,
          maxHeight: 1200,
          imageQuality: 80,
        );
        if (picked.isNotEmpty) {
          final toAdd = picked.take(remaining).map((x) => File(x.path)).toList();
          setState(() => _selectedPhotos.addAll(toAdd));
          if (picked.length > remaining) {
            _showSnack('Hanya ${remaining} foto yang ditambahkan (maks 3)', Colors.orange);
          }
        }
      } else {
        final picked = await _picker.pickImage(
          source: ImageSource.camera,
          maxWidth: 1200,
          maxHeight: 1200,
          imageQuality: 80,
        );
        if (picked != null) {
          setState(() => _selectedPhotos.add(File(picked.path)));
        }
      }
    } catch (e) {
      _showSnack('Gagal memilih foto: $e', Colors.red);
    }
  }

  void _removePhoto(int index) {
    setState(() => _selectedPhotos.removeAt(index));
  }

  void _showSnack(String msg, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: color,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    ));
  }

  InputDecoration _dec(String label, IconData icon) => InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: const Color(0xFF2E7D32)),
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey.shade200)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF2E7D32), width: 1.5)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      );

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    final auth = context.read<AuthProvider>();
    final pp = context.read<ProdukProvider>();
    final body = <String, dynamic>{
      'nama_produk': _namaC.text.trim(),
      'kategori': _kategoriC.text.trim(),
      'harga_per_kg': int.parse(_hargaC.text.trim()),
      'stok_kg': int.parse(_stokC.text.trim()),
      'deskripsi': _deskripsiC.text.trim(),
      'status': _status,
    };
    if (!_isEdit) {
      final pid = auth.petaniId;
      debugPrint('DEBUG petaniId: $pid, user: ${auth.user?.petani?.id}, role: ${auth.user?.role}');
      if (pid == null) {
        _showSnack('petani_id tidak ditemukan, coba login ulang', Colors.red);
        setState(() => _loading = false);
        return;
      }
      body['petani_id'] = pid;
    }

    debugPrint('DEBUG body: $body, photos: ${_selectedPhotos.length}');

    try {
      if (_isEdit) {
        await pp.updateProduk(auth.token!, widget.produk!.id, body);
      } else {
        await pp.createProduk(
          auth.token!,
          body,
          photos: _selectedPhotos.isNotEmpty ? _selectedPhotos : null,
        );
      }
      if (!mounted) return;
      _showSnack(_isEdit ? 'Produk diupdate' : 'Produk ditambahkan', const Color(0xFF2E7D32));
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      _showSnack('$e', Colors.red);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: Text(_isEdit ? 'Edit Produk' : 'Tambah Produk'),
        backgroundColor: const Color(0xFF2E7D32),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            // Photo picker section
            _sectionTitle('Foto Produk'),
            const SizedBox(height: 8),
            Text(
              'Maks 3 foto, ukuran < 5MB',
              style: TextStyle(color: Colors.grey[500], fontSize: 12),
            ),
            const SizedBox(height: 12),
            _photoSection(),
            const SizedBox(height: 20),

            // Existing photos (edit mode)
            if (_isEdit && widget.produk!.fotoUrls.isNotEmpty) ...[
              _sectionTitle('Foto Saat Ini'),
              const SizedBox(height: 8),
              SizedBox(
                height: 80,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: widget.produk!.fotoUrls.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (_, i) => ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.network(
                      widget.produk!.fotoUrls[i],
                      width: 80,
                      height: 80,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        width: 80,
                        height: 80,
                        color: const Color(0xFFE8F5E9),
                        child: const Icon(Icons.broken_image, color: Color(0xFF81C784)),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Form fields
            _sectionTitle('Detail Produk'),
            const SizedBox(height: 12),
            TextFormField(
              controller: _namaC,
              decoration: _dec('Nama Produk *', Icons.eco_outlined),
              validator: (v) => v == null || v.isEmpty ? 'Wajib diisi' : null,
            ),
            const SizedBox(height: 14),
            TextFormField(controller: _kategoriC, decoration: _dec('Kategori', Icons.category_outlined)),
            const SizedBox(height: 14),
            TextFormField(
              controller: _hargaC,
              keyboardType: TextInputType.number,
              decoration: _dec('Harga per Kg (Rp) *', Icons.monetization_on_outlined),
              validator: (v) => v == null || v.isEmpty ? 'Wajib diisi' : null,
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _stokC,
              keyboardType: TextInputType.number,
              decoration: _dec('Stok (Kg) *', Icons.scale_outlined),
              validator: (v) => v == null || v.isEmpty ? 'Wajib diisi' : null,
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _deskripsiC,
              decoration: _dec('Deskripsi', Icons.description_outlined),
              maxLines: 3,
            ),
            const SizedBox(height: 14),
            DropdownButtonFormField<String>(
              value: _status,
              decoration: _dec('Status', Icons.toggle_on_outlined),
              items: ['tersedia', 'habis', 'nonaktif']
                  .map((s) => DropdownMenuItem(value: s, child: Text(s.toUpperCase())))
                  .toList(),
              onChanged: (v) => setState(() => _status = v!),
            ),
            const SizedBox(height: 28),
            SizedBox(
              height: 52,
              child: ElevatedButton(
                onPressed: _loading ? null : _save,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2E7D32),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                child: _loading
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : Text(
                        _isEdit ? 'Update Produk' : 'Simpan Produk',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                      ),
              ),
            ),
          ]),
        ),
      ),
    );
  }

  Widget _photoSection() {
    return SizedBox(
      height: 110,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          // Selected photos
          ..._selectedPhotos.asMap().entries.map((entry) => Padding(
                padding: const EdgeInsets.only(right: 10),
                child: Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: Image.file(
                        entry.value,
                        width: 100,
                        height: 100,
                        fit: BoxFit.cover,
                      ),
                    ),
                    Positioned(
                      top: 4,
                      right: 4,
                      child: GestureDetector(
                        onTap: () => _removePhoto(entry.key),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: Colors.red,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.close, size: 14, color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
              )),

          // Add button
          if (_selectedPhotos.length < 3)
            GestureDetector(
              onTap: _pickPhotos,
              child: Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF2E7D32), width: 1.5, style: BorderStyle.solid),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.add_a_photo, color: Color(0xFF2E7D32), size: 28),
                    const SizedBox(height: 6),
                    Text(
                      '${_selectedPhotos.length}/3',
                      style: TextStyle(color: Colors.grey[600], fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title) => Row(
        children: [
          Container(
            width: 4,
            height: 18,
            decoration: BoxDecoration(
              color: const Color(0xFF2E7D32),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 8),
          Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF1B5E20))),
        ],
      );
}
