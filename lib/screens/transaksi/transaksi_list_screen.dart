import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/transaksi_service.dart';
import '../../models/transaksi.dart';
import '../../widgets/status_badge.dart';
import 'transaksi_detail_screen.dart';

class TransaksiListScreen extends StatefulWidget {
  const TransaksiListScreen({super.key});
  @override
  State<TransaksiListScreen> createState() => _TransaksiListScreenState();
}

class _TransaksiListScreenState extends State<TransaksiListScreen>
    with SingleTickerProviderStateMixin {
  final TransaksiService _service = TransaksiService();
  List<Transaksi> _list = [];
  bool _loading = true;
  late TabController _tabController;

  // Tab definitions
  static const _tabs = [
    _StatusTab('Semua', null, Icons.list_alt, Color(0xFF455A64)),
    _StatusTab('Verifikasi', 'pending', Icons.hourglass_top, Color(0xFFF57C00)),
    _StatusTab('Pembayaran', 'dikonfirmasi', Icons.payment, Color(0xFF7B1FA2)),
    _StatusTab('Dikirim', 'dikirim', Icons.local_shipping, Color(0xFF1565C0)),
    _StatusTab('Selesai', 'selesai', Icons.check_circle, Color(0xFF2E7D32)),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final token = context.read<AuthProvider>().token!;
      _list = await _service.getAll(token);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  List<Transaksi> _filtered(String? status) {
    if (status == null) return _list;
    return _list.where((t) => t.status == status).toList();
  }

  int _countForStatus(String? status) => _filtered(status).length;

  @override
  Widget build(BuildContext context) {
    final role = context.read<AuthProvider>().role;
    final isPembeli = role == 'pembeli';

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: Text(isPembeli ? 'Pesanan Saya' : 'Pesanan Masuk'),
        backgroundColor: const Color(0xFF2E7D32),
        foregroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF2E7D32)))
          : Column(
              children: [
                // === Shopee-style status icon row (pembeli only) ===
                if (isPembeli) _buildStatusIconRow(),

                // === Tab bar ===
                Container(
                  color: Colors.white,
                  child: TabBar(
                    controller: _tabController,
                    isScrollable: true,
                    labelColor: const Color(0xFF2E7D32),
                    unselectedLabelColor: Colors.grey[600],
                    indicatorColor: const Color(0xFF2E7D32),
                    indicatorWeight: 3,
                    labelStyle: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 13),
                    unselectedLabelStyle: const TextStyle(fontSize: 13),
                    tabAlignment: TabAlignment.start,
                    tabs: _tabs.map((tab) {
                      final count = _countForStatus(tab.status);
                      return Tab(
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(tab.label),
                            if (count > 0) ...[
                              const SizedBox(width: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 6, vertical: 1),
                                decoration: BoxDecoration(
                                  color:
                                      const Color(0xFF2E7D32).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text('$count',
                                    style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF2E7D32))),
                              ),
                            ],
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),

                // === Tab content ===
                Expanded(
                  child: TabBarView(
                    controller: _tabController,
                    children: _tabs.map((tab) {
                      final filtered = _filtered(tab.status);
                      return RefreshIndicator(
                        color: const Color(0xFF2E7D32),
                        onRefresh: _load,
                        child: filtered.isEmpty
                            ? ListView(children: [
                                SizedBox(
                                  height:
                                      MediaQuery.of(context).size.height * 0.4,
                                  child: Center(
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(Icons.receipt_long_outlined,
                                            size: 56,
                                            color: Colors.grey[300]),
                                        const SizedBox(height: 12),
                                        Text('Belum ada pesanan',
                                            style: TextStyle(
                                                fontSize: 14,
                                                color: Colors.grey[500])),
                                      ],
                                    ),
                                  ),
                                ),
                              ])
                            : ListView.builder(
                                padding: const EdgeInsets.all(16),
                                itemCount: filtered.length,
                                itemBuilder: (_, i) => _tile(filtered[i]),
                              ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
    );
  }

  /// Shopee-style status icon row at the top
  Widget _buildStatusIconRow() {
    final icons = [
      _StatusIcon('Verifikasi', Icons.hourglass_top, const Color(0xFFF57C00),
          _countForStatus('pending'), 1),
      _StatusIcon('Pembayaran', Icons.payment, const Color(0xFF7B1FA2),
          _countForStatus('dikonfirmasi'), 2),
      _StatusIcon('Dikirim', Icons.local_shipping, const Color(0xFF1565C0),
          _countForStatus('dikirim'), 3),
      _StatusIcon('Selesai', Icons.check_circle, const Color(0xFF2E7D32),
          _countForStatus('selesai'), 4),
    ];

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: icons.map((icon) {
          return GestureDetector(
            onTap: () => _tabController.animateTo(icon.tabIndex),
            child: Column(
              children: [
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: icon.color.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Icon(icon.icon, color: icon.color, size: 26),
                    ),
                    if (icon.count > 0)
                      Positioned(
                        top: -6,
                        right: -6,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: Colors.red,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                          child: Text('${icon.count}',
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold)),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(icon.label,
                    style:
                        TextStyle(fontSize: 11, color: Colors.grey[700])),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _tile(Transaksi t) => GestureDetector(
        onTap: () async {
          await Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (_) => TransaksiDetailScreen(transaksi: t)));
          _load();
        },
        child: Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2))
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                      color: const Color(0xFFF57C00).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.receipt_long,
                      color: Color(0xFFF57C00), size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                      Text('Transaksi #${t.id}',
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 15)),
                      Text(t.namaProduk ?? 'Produk #${t.produkId}',
                          style: TextStyle(
                              color: Colors.grey[600], fontSize: 12)),
                    ])),
                StatusBadge(status: t.status),
              ]),
              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 12),
              Row(children: [
                Icon(Icons.person_outline, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Text(t.namaPembeli ?? 'Pembeli #${t.pembeliId}',
                    style:
                        TextStyle(color: Colors.grey[700], fontSize: 13)),
                const Spacer(),
                Text('${t.jumlahKg.toStringAsFixed(0)} kg',
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(width: 8),
                Text('Rp ${t.totalHarga.toStringAsFixed(0)}',
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF2E7D32),
                        fontSize: 13)),
              ]),
              // Pembayaran badge jika ada
              if (t.sudahBayar) ...[
                const SizedBox(height: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF7B1FA2).withOpacity(0.08),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.payment,
                          size: 14, color: Color(0xFF7B1FA2)),
                      const SizedBox(width: 4),
                      Text(
                        'Dibayar via ${t.metode ?? "-"}',
                        style: const TextStyle(
                            fontSize: 11,
                            color: Color(0xFF7B1FA2),
                            fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ),
              ],
              // Perlu bayar indicator
              if (t.perluBayar) ...[
                const SizedBox(height: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.warning_amber_rounded,
                          size: 14, color: Colors.red),
                      SizedBox(width: 4),
                      Text('Menunggu Pembayaran',
                          style: TextStyle(
                              fontSize: 11,
                              color: Colors.red,
                              fontWeight: FontWeight.w500)),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 4),
              Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                Icon(Icons.chevron_right, color: Colors.grey[400], size: 20),
              ]),
            ],
          ),
        ),
      );
}

class _StatusTab {
  final String label;
  final String? status;
  final IconData icon;
  final Color color;
  const _StatusTab(this.label, this.status, this.icon, this.color);
}

class _StatusIcon {
  final String label;
  final IconData icon;
  final Color color;
  final int count;
  final int tabIndex;
  const _StatusIcon(
      this.label, this.icon, this.color, this.count, this.tabIndex);
}
