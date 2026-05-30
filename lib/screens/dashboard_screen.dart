import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/produk_provider.dart';

import '../services/transaksi_service.dart';
import '../models/transaksi.dart';
import '../widgets/stat_card.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {

  final TransaksiService _transaksiService = TransaksiService();
  List<Transaksi> _transaksiTerbaru = [];
  int _totalProduk = 0;
  int _transaksiPending = 0;
  double _totalStok = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadDashboard());
  }

  Future<void> _loadDashboard() async {
    setState(() => _isLoading = true);
    final auth = context.read<AuthProvider>();
    final produkProvider = context.read<ProdukProvider>();
    final token = auth.token!;
    final petaniId = auth.petaniId;

    try {
      await produkProvider.fetchProduk(token);
      final myProduk = petaniId != null
          ? produkProvider.getProdukByPetani(petaniId)
          : produkProvider.produkList;

      final allTransaksi = await _transaksiService.getAll(token);

      if (!mounted) return;

      // Filter transaksi hanya milik petani ini (client-side safety net)
      final transaksiList = petaniId != null
          ? allTransaksi.where((t) => t.petaniId == petaniId).toList()
          : allTransaksi;

      // Hitung total stok dari produk (kecuali yang ditolak)
      double totalStok = 0;
      for (var p in myProduk) {
        if (p.status != 'ditolak') {
          totalStok += p.stokKg;
        }
      }

      setState(() {
        _totalProduk = myProduk.length;
        _totalStok = totalStok;
        _transaksiPending = transaksiList.where((t) => t.status == 'pending').length;
        _transaksiTerbaru = transaksiList.take(5).toList();
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: RefreshIndicator(
        color: const Color(0xFF2E7D32),
        onRefresh: _loadDashboard,
        child: CustomScrollView(
          slivers: [
            // App bar with greeting
            SliverAppBar(
              expandedHeight: 140,
              floating: false,
              pinned: true,
              backgroundColor: const Color(0xFF2E7D32),
              automaticallyImplyLeading: false,
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFF1B5E20), Color(0xFF43A047)],
                    ),
                  ),
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 22,
                                backgroundColor: Colors.white.withOpacity(0.2),
                                child: Text(
                                  (user?.nama ?? 'P')[0].toUpperCase(),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Halo, ${user?.nama ?? 'Petani'}! 👋',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      user?.petani?.namaUsaha ?? 'Petani',
                                      style: TextStyle(
                                        color: Colors.white.withOpacity(0.8),
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(Icons.eco, color: Colors.white, size: 28),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Stats cards
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverToBoxAdapter(
                child: _isLoading
                    ? const Center(
                        child: Padding(
                          padding: EdgeInsets.all(32),
                          child: CircularProgressIndicator(color: Color(0xFF2E7D32)),
                        ),
                      )
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Ringkasan',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1B5E20),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: StatCard(
                                  title: 'Total Produk',
                                  value: '$_totalProduk',
                                  icon: Icons.inventory_2_outlined,
                                  color: const Color(0xFF2E7D32),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: StatCard(
                                  title: 'Total Stok (kg)',
                                  value: _totalStok.toStringAsFixed(0),
                                  icon: Icons.scale_outlined,
                                  color: const Color(0xFF1565C0),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: StatCard(
                                  title: 'Pesanan Masuk',
                                  value: '$_transaksiPending',
                                  icon: Icons.receipt_long_outlined,
                                  color: const Color(0xFFF57C00),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: StatCard(
                                  title: 'Transaksi',
                                  value: '${_transaksiTerbaru.length}',
                                  icon: Icons.trending_up,
                                  color: const Color(0xFF7B1FA2),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),

                          // Recent transactions
                          const Text(
                            'Transaksi Terbaru',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1B5E20),
                            ),
                          ),
                          const SizedBox(height: 12),
                          if (_transaksiTerbaru.isEmpty)
                            Container(
                              padding: const EdgeInsets.all(24),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Center(
                                child: Column(
                                  children: [
                                    Icon(Icons.inbox_outlined, size: 48, color: Colors.grey[300]),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Belum ada transaksi',
                                      style: TextStyle(color: Colors.grey[500]),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ..._transaksiTerbaru.map(_buildTransaksiTile),
                        ],
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTransaksiTile(Transaksi t) {
    Color statusColor;
    switch (t.status) {
      case 'pending':
        statusColor = const Color(0xFFF57C00);
        break;
      case 'dikonfirmasi':
        statusColor = const Color(0xFF1565C0);
        break;
      case 'selesai':
        statusColor = const Color(0xFF2E7D32);
        break;
      default:
        statusColor = Colors.grey;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 40,
            decoration: BoxDecoration(
              color: statusColor,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  t.namaProduk ?? 'Produk #${t.produkId}',
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                ),
                Text(
                  '${t.jumlahKg.toStringAsFixed(0)} kg • Rp ${t.totalHarga.toStringAsFixed(0)}',
                  style: TextStyle(color: Colors.grey[600], fontSize: 12),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              t.status.toUpperCase(),
              style: TextStyle(
                color: statusColor,
                fontSize: 10,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
