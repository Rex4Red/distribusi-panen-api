import 'package:flutter/material.dart';
import 'katalog_produk_screen.dart';
import '../transaksi/transaksi_list_screen.dart';
import '../profile_screen.dart';

class PembeliHomeScreen extends StatefulWidget {
  const PembeliHomeScreen({super.key});
  @override
  State<PembeliHomeScreen> createState() => _PembeliHomeScreenState();
}

class _PembeliHomeScreenState extends State<PembeliHomeScreen> {
  int _index = 0;

  final _screens = const [
    KatalogProdukScreen(),
    TransaksiListScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_index],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 12, offset: const Offset(0, -2))],
        ),
        child: NavigationBar(
          selectedIndex: _index,
          onDestinationSelected: (i) => setState(() => _index = i),
          backgroundColor: Colors.white,
          indicatorColor: const Color(0xFF2E7D32).withOpacity(0.12),
          height: 65,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          destinations: const [
            NavigationDestination(icon: Icon(Icons.storefront_outlined), selectedIcon: Icon(Icons.storefront, color: Color(0xFF2E7D32)), label: 'Katalog'),
            NavigationDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long, color: Color(0xFF2E7D32)), label: 'Pesanan'),
            NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person, color: Color(0xFF2E7D32)), label: 'Profil'),
          ],
        ),
      ),
    );
  }
}
