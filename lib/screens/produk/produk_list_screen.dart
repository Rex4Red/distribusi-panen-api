import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/produk_provider.dart';
import '../../models/produk.dart';
import '../../widgets/status_badge.dart';
import 'produk_form_screen.dart';

class ProdukListScreen extends StatefulWidget {
  const ProdukListScreen({super.key});
  @override
  State<ProdukListScreen> createState() => _ProdukListScreenState();
}

class _ProdukListScreenState extends State<ProdukListScreen> {
  String _filter = 'semua'; // semua, tersedia, habis, nonaktif, menunggu_verifikasi

  @override
  void initState() {
    super.initState();
    _loadProduk();
  }

  Future<void> _loadProduk() async {
    final auth = context.read<AuthProvider>();
    await context.read<ProdukProvider>().fetchProduk(auth.token!);
  }

  List<Produk> _applyFilter(List<Produk> list) {
    if (_filter == 'semua') return list;
    if (_filter == 'habis') {
      return list.where((p) => p.stokKg <= 0 && p.status != 'nonaktif').toList();
    }
    return list.where((p) => p.status == _filter).toList();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final pp = context.watch<ProdukProvider>();
    final isPetani = auth.role == 'petani';
    final pid = auth.petaniId;
    final allList = isPetani && pid != null ? pp.getProdukByPetani(pid) : pp.produkList;
    final list = _applyFilter(allList);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: Text(isPetani ? 'Produk Panen Saya' : 'Katalog Produk'),
        backgroundColor: const Color(0xFF2E7D32),
        foregroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: pp.isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF2E7D32)))
          : RefreshIndicator(
              color: const Color(0xFF2E7D32),
              onRefresh: _loadProduk,
              child: Column(
                children: [
                  // Filter chips
                  if (isPetani) _buildFilterBar(allList),
                  // Product list
                  Expanded(
                    child: list.isEmpty
                        ? _emptyState(context)
                        : ListView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                            itemCount: list.length,
                            itemBuilder: (_, i) => _card(list[i], isPetani),
                          ),
                  ),
                ],
              ),
            ),
      floatingActionButton: isPetani
          ? FloatingActionButton.extended(
              onPressed: () async {
                final r = await Navigator.push(context, MaterialPageRoute(builder: (_) => const ProdukFormScreen()));
                if (r == true) _loadProduk();
              },
              backgroundColor: const Color(0xFF2E7D32),
              icon: const Icon(Icons.add, color: Colors.white),
              label: const Text('Tambah', style: TextStyle(color: Colors.white)),
            )
          : null,
    );
  }

  Widget _buildFilterBar(List<Produk> allList) {
    // Count per status
    final countTersedia = allList.where((p) => p.status == 'tersedia').length;
    final countHabis = allList.where((p) => p.stokKg <= 0 && p.status != 'nonaktif').length;
    final countNonaktif = allList.where((p) => p.status == 'nonaktif').length;
    final countMenunggu = allList.where((p) => p.status == 'menunggu_verifikasi').length;

    final filters = <Map<String, dynamic>>[
      {'key': 'semua', 'label': 'Semua', 'count': allList.length},
      {'key': 'tersedia', 'label': 'Tersedia', 'count': countTersedia},
      {'key': 'habis', 'label': 'Habis', 'count': countHabis},
      {'key': 'nonaktif', 'label': 'Nonaktif', 'count': countNonaktif},
      if (countMenunggu > 0)
        {'key': 'menunggu_verifikasi', 'label': 'Menunggu', 'count': countMenunggu},
    ];

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Row(
          children: filters.map((f) {
            final isActive = _filter == f['key'];
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: FilterChip(
                selected: isActive,
                label: Text(
                  '${f['label']} (${f['count']})',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                    color: isActive ? Colors.white : Colors.grey[700],
                  ),
                ),
                selectedColor: const Color(0xFF2E7D32),
                backgroundColor: const Color(0xFFF5F5F5),
                checkmarkColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                  side: BorderSide(
                    color: isActive ? const Color(0xFF2E7D32) : Colors.grey.shade300,
                  ),
                ),
                onSelected: (_) => setState(() => _filter = f['key'] as String),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _emptyState(BuildContext ctx) => ListView(children: [
        SizedBox(
          height: MediaQuery.of(ctx).size.height * 0.4,
          child: Center(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey[300]),
              const SizedBox(height: 12),
              Text(
                _filter == 'semua' ? 'Belum ada produk' : 'Tidak ada produk "$_filter"',
                style: TextStyle(fontSize: 16, color: Colors.grey[500]),
              ),
              const SizedBox(height: 4),
              if (_filter == 'semua')
                Text('Tap + untuk menambah', style: TextStyle(fontSize: 13, color: Colors.grey[400])),
              if (_filter != 'semua')
                TextButton(
                  onPressed: () => setState(() => _filter = 'semua'),
                  child: const Text('Tampilkan Semua'),
                ),
            ]),
          ),
        ),
      ]);

  Widget _card(Produk p, bool isPetani) => Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: p.status == 'nonaktif' ? Colors.grey[50] : Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        padding: const EdgeInsets.all(16),
        child: Opacity(
          opacity: p.status == 'nonaktif' ? 0.6 : 1.0,
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Container(
                width: 48, height: 48,
                decoration: BoxDecoration(color: const Color(0xFF2E7D32).withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.eco, color: Color(0xFF2E7D32), size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(p.namaProduk, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                if (p.kategori != null) Text(p.kategori!, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
              ])),
              StatusBadge(status: p.stokKg <= 0 && p.status != 'nonaktif' ? 'habis' : p.status),
            ]),
            const SizedBox(height: 12),
            const Divider(height: 1),
            const SizedBox(height: 12),
            Row(children: [
              Icon(Icons.monetization_on_outlined, size: 16, color: Colors.grey[600]),
              const SizedBox(width: 4),
              Text('Rp ${p.hargaPerKg.toStringAsFixed(0)}/kg', style: TextStyle(color: Colors.grey[700], fontSize: 13)),
              const SizedBox(width: 16),
              Icon(Icons.scale_outlined, size: 16, color: Colors.grey[600]),
              const SizedBox(width: 4),
              Text('${p.stokKg.toStringAsFixed(0)} kg', style: TextStyle(color: Colors.grey[700], fontSize: 13)),
            ]),
            if (isPetani) ...[
              const SizedBox(height: 12),
              Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                TextButton.icon(
                  onPressed: () async {
                    final r = await Navigator.push(context, MaterialPageRoute(builder: (_) => ProdukFormScreen(produk: p)));
                    if (r == true) _loadProduk();
                  },
                  icon: const Icon(Icons.edit_outlined, size: 18),
                  label: const Text('Edit'),
                  style: TextButton.styleFrom(foregroundColor: const Color(0xFF2E7D32)),
                ),
                TextButton.icon(
                  onPressed: () => _delete(p),
                  icon: const Icon(Icons.delete_outline, size: 18),
                  label: const Text('Hapus'),
                  style: TextButton.styleFrom(foregroundColor: Colors.red[600]),
                ),
              ]),
            ],
          ]),
        ),
      );

  Future<void> _delete(Produk p) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Hapus Produk?'),
        content: Text('Yakin hapus "${p.namaProduk}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(c, false), child: const Text('Batal')),
          TextButton(onPressed: () => Navigator.pop(c, true), child: const Text('Hapus', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await context.read<ProdukProvider>().deleteProduk(context.read<AuthProvider>().token!, p.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Produk dihapus'), backgroundColor: Color(0xFF2E7D32), behavior: SnackBarBehavior.floating),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e'), backgroundColor: Colors.red));
    }
  }
}
