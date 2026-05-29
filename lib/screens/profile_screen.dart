import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    final petani = user?.petani;
    final pembeli = user?.pembeli;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 180, pinned: true, automaticallyImplyLeading: false,
            backgroundColor: const Color(0xFF2E7D32),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft, end: Alignment.bottomRight,
                    colors: [Color(0xFF1B5E20), Color(0xFF43A047)],
                  ),
                ),
                child: SafeArea(
                  child: Center(
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                      CircleAvatar(
                        radius: 36,
                        backgroundColor: Colors.white.withOpacity(0.2),
                        child: Text(
                          (user?.nama ?? 'P')[0].toUpperCase(),
                          style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(user?.nama ?? '', style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                      Text(user?.email ?? '', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
                    ]),
                  ),
                ),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                _section('Informasi Akun'),
                _infoCard([
                  _infoRow(Icons.person_outline, 'Nama', user?.nama ?? '-'),
                  _infoRow(Icons.email_outlined, 'Email', user?.email ?? '-'),
                  _infoRow(Icons.phone_outlined, 'Telepon', user?.phone ?? '-'),
                  _infoRow(Icons.badge_outlined, 'Role', user?.role ?? '-'),
                  _infoRow(Icons.location_on_outlined, 'Alamat', user?.alamat ?? '-'),
                ]),
                const SizedBox(height: 16),
                if (petani != null) ...[
                  _section('Informasi Usaha Tani'),
                  _infoCard([
                    _infoRow(Icons.store_outlined, 'Nama Usaha', petani.namaUsaha ?? '-'),
                    _infoRow(Icons.map_outlined, 'Lokasi', petani.lokasi ?? '-'),
                    _infoRow(Icons.terrain_outlined, 'Luas Lahan', '${petani.luasLahan ?? '-'} hektar'),
                    _infoRow(Icons.grass_outlined, 'Jenis Tanaman', petani.jenisTanaman ?? '-'),
                  ]),
                  const SizedBox(height: 24),
                ],
                if (pembeli != null) ...[
                  _section('Informasi Bisnis'),
                  _infoCard([
                    _infoRow(Icons.business_outlined, 'Nama Bisnis', pembeli.namaBisnis ?? '-'),
                    _infoRow(Icons.category_outlined, 'Tipe', pembeli.tipe ?? '-'),
                    _infoRow(Icons.location_city_outlined, 'Alamat Bisnis', pembeli.alamatBisnis ?? '-'),
                  ]),
                  const SizedBox(height: 24),
                ],
                SizedBox(
                  width: double.infinity, height: 50,
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      final ok = await showDialog<bool>(
                        context: context,
                        builder: (c) => AlertDialog(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          title: const Text('Keluar?'),
                          content: const Text('Yakin ingin keluar dari akun?'),
                          actions: [
                            TextButton(onPressed: () => Navigator.pop(c, false), child: const Text('Batal')),
                            TextButton(onPressed: () => Navigator.pop(c, true), child: const Text('Keluar', style: TextStyle(color: Colors.red))),
                          ],
                        ),
                      );
                      if (ok != true) return;
                      await context.read<AuthProvider>().logout();
                      if (!context.mounted) return;
                      Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const LoginScreen()), (r) => false);
                    },
                    icon: const Icon(Icons.logout),
                    label: const Text('Keluar', style: TextStyle(fontWeight: FontWeight.w600)),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red, side: const BorderSide(color: Colors.red),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _section(String title) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Row(children: [
      Container(width: 4, height: 20, decoration: BoxDecoration(color: const Color(0xFF2E7D32), borderRadius: BorderRadius.circular(2))),
      const SizedBox(width: 8),
      Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1B5E20))),
    ]),
  );

  Widget _infoCard(List<Widget> children) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
    child: Column(children: children),
  );

  Widget _infoRow(IconData icon, String label, String value) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Row(children: [
      Icon(icon, size: 20, color: const Color(0xFF2E7D32)),
      const SizedBox(width: 12),
      Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
      const Spacer(),
      Flexible(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13), textAlign: TextAlign.end)),
    ]),
  );
}
