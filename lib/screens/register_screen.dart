import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'home_screen.dart';
import 'pembeli/pembeli_home_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _namaC = TextEditingController();
  final _emailC = TextEditingController();
  final _passwordC = TextEditingController();
  final _phoneC = TextEditingController();
  final _alamatC = TextEditingController();
  // Petani fields
  final _namaUsahaC = TextEditingController();
  final _lokasiC = TextEditingController();
  final _luasLahanC = TextEditingController();
  final _jenisTanamanC = TextEditingController();
  // Pembeli fields
  final _namaBisnisC = TextEditingController();
  final _tipeC = TextEditingController();
  final _alamatBisnisC = TextEditingController();

  bool _obscure = true;
  String _selectedRole = 'petani';

  @override
  void dispose() {
    _namaC.dispose();
    _emailC.dispose();
    _passwordC.dispose();
    _phoneC.dispose();
    _alamatC.dispose();
    _namaUsahaC.dispose();
    _lokasiC.dispose();
    _luasLahanC.dispose();
    _jenisTanamanC.dispose();
    _namaBisnisC.dispose();
    _tipeC.dispose();
    _alamatBisnisC.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;

    try {
      await context.read<AuthProvider>().register(
            nama: _namaC.text.trim(),
            email: _emailC.text.trim(),
            password: _passwordC.text,
            role: _selectedRole,
            phone: _phoneC.text.trim().isEmpty ? null : _phoneC.text.trim(),
            alamat: _alamatC.text.trim().isEmpty ? null : _alamatC.text.trim(),
            // Petani fields
            namaUsaha: _selectedRole == 'petani' && _namaUsahaC.text.trim().isNotEmpty
                ? _namaUsahaC.text.trim()
                : null,
            lokasi: _selectedRole == 'petani' && _lokasiC.text.trim().isNotEmpty
                ? _lokasiC.text.trim()
                : null,
            luasLahan: _selectedRole == 'petani' && _luasLahanC.text.trim().isNotEmpty
                ? double.tryParse(_luasLahanC.text.trim())
                : null,
            jenisTanaman: _selectedRole == 'petani' && _jenisTanamanC.text.trim().isNotEmpty
                ? _jenisTanamanC.text.trim()
                : null,
            // Pembeli fields
            namaBisnis: _selectedRole == 'pembeli' && _namaBisnisC.text.trim().isNotEmpty
                ? _namaBisnisC.text.trim()
                : null,
            tipe: _selectedRole == 'pembeli' && _tipeC.text.trim().isNotEmpty
                ? _tipeC.text.trim()
                : null,
            alamatBisnis: _selectedRole == 'pembeli' && _alamatBisnisC.text.trim().isNotEmpty
                ? _alamatBisnisC.text.trim()
                : null,
          );
      if (!mounted) return;

      final role = context.read<AuthProvider>().role;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (_) => role == 'pembeli'
              ? const PembeliHomeScreen()
              : const HomeScreen(),
        ),
        (route) => false,
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: Colors.red[700],
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon, color: const Color(0xFF2E7D32)),
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: Colors.grey.shade200),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFF2E7D32), width: 1.5),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('Daftar Akun'),
        backgroundColor: const Color(0xFF2E7D32),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Role selector
              _sectionTitle('Pilih Role'),
              const SizedBox(height: 12),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Row(
                  children: [
                    _roleTab('petani', 'Petani', Icons.agriculture),
                    _roleTab('pembeli', 'Pembeli', Icons.shopping_bag),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Section: Data Pribadi
              _sectionTitle('Data Pribadi'),
              const SizedBox(height: 12),
              TextFormField(
                controller: _namaC,
                decoration: _inputDecoration('Nama Lengkap *', Icons.person_outline),
                validator: (v) => v == null || v.isEmpty ? 'Nama wajib diisi' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _emailC,
                keyboardType: TextInputType.emailAddress,
                decoration: _inputDecoration('Email *', Icons.email_outlined),
                validator: (v) => v == null || v.isEmpty ? 'Email wajib diisi' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _passwordC,
                obscureText: _obscure,
                decoration: _inputDecoration('Password *', Icons.lock_outline).copyWith(
                  suffixIcon: IconButton(
                    icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility, color: Colors.grey),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  ),
                ),
                validator: (v) =>
                    v == null || v.length < 6 ? 'Password minimal 6 karakter' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phoneC,
                keyboardType: TextInputType.phone,
                decoration: _inputDecoration('No. Telepon', Icons.phone_outlined),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _alamatC,
                decoration: _inputDecoration('Alamat', Icons.location_on_outlined),
                maxLines: 2,
              ),
              const SizedBox(height: 24),

              // Conditional role-specific fields
              if (_selectedRole == 'petani') ..._petaniFields(),
              if (_selectedRole == 'pembeli') ..._pembeliFields(),

              const SizedBox(height: 4),

              // Register button
              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: auth.isLoading ? null : _register,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2E7D32),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  child: auth.isLoading
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text(
                          'Daftar Sekarang',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                        ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _roleTab(String role, String label, IconData icon) {
    final selected = _selectedRole == role;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedRole = role),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: selected ? const Color(0xFF2E7D32) : Colors.transparent,
            borderRadius: BorderRadius.circular(13),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 20, color: selected ? Colors.white : Colors.grey[600]),
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: selected ? Colors.white : Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  List<Widget> _petaniFields() => [
        _sectionTitle('Data Usaha Tani'),
        const SizedBox(height: 12),
        TextFormField(
          controller: _namaUsahaC,
          decoration: _inputDecoration('Nama Usaha', Icons.store_outlined),
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: _lokasiC,
          decoration: _inputDecoration('Lokasi Kebun', Icons.map_outlined),
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: _luasLahanC,
          keyboardType: TextInputType.number,
          decoration: _inputDecoration('Luas Lahan (hektar)', Icons.terrain_outlined),
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: _jenisTanamanC,
          decoration: _inputDecoration('Jenis Tanaman', Icons.grass_outlined),
        ),
        const SizedBox(height: 28),
      ];

  List<Widget> _pembeliFields() => [
        _sectionTitle('Data Bisnis'),
        const SizedBox(height: 12),
        TextFormField(
          controller: _namaBisnisC,
          decoration: _inputDecoration('Nama Bisnis', Icons.business_outlined),
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: _tipeC,
          decoration: _inputDecoration('Tipe Bisnis (restoran, toko, dll)', Icons.category_outlined),
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: _alamatBisnisC,
          decoration: _inputDecoration('Alamat Bisnis', Icons.location_city_outlined),
          maxLines: 2,
        ),
        const SizedBox(height: 28),
      ];

  Widget _sectionTitle(String title) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 20,
          decoration: BoxDecoration(
            color: const Color(0xFF2E7D32),
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1B5E20)),
        ),
      ],
    );
  }
}
