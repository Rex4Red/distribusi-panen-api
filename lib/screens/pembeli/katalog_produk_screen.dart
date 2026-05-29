import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/produk_provider.dart';
import '../../models/produk.dart';
import 'produk_detail_screen.dart';

class KatalogProdukScreen extends StatefulWidget {
  const KatalogProdukScreen({super.key});
  @override
  State<KatalogProdukScreen> createState() => _KatalogProdukScreenState();
}

class _KatalogProdukScreenState extends State<KatalogProdukScreen> {
  final _searchC = TextEditingController();
  String? _selectedKategori;

  final _kategoriList = ['Sayuran', 'Buah', 'Biji-bijian', 'Umbi', 'Rempah', 'Lainnya'];

  @override
  void initState() {
    super.initState();
    _loadProduk();
  }

  @override
  void dispose() {
    _searchC.dispose();
    super.dispose();
  }

  Future<void> _loadProduk() async {
    final auth = context.read<AuthProvider>();
    await context.read<ProdukProvider>().fetchProduk(auth.token!);
  }

  List<Produk> _filteredList(List<Produk> all) {
    var list = all.where((p) => p.status == 'tersedia').toList();
    final q = _searchC.text.trim().toLowerCase();
    if (q.isNotEmpty) {
      list = list.where((p) =>
          p.namaProduk.toLowerCase().contains(q) ||
          (p.kategori?.toLowerCase().contains(q) ?? false) ||
          (p.namaUsaha?.toLowerCase().contains(q) ?? false)).toList();
    }
    if (_selectedKategori != null) {
      list = list.where((p) => p.kategori?.toLowerCase() == _selectedKategori!.toLowerCase()).toList();
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final pp = context.watch<ProdukProvider>();
    final list = _filteredList(pp.produkList);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: RefreshIndicator(
        color: const Color(0xFF2E7D32),
        onRefresh: _loadProduk,
        child: CustomScrollView(
          slivers: [
            // App bar
            SliverAppBar(
              expandedHeight: 120,
              floating: true,
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
                      padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.eco, color: Colors.white, size: 28),
                              const SizedBox(width: 8),
                              const Text(
                                'PanenKu',
                                style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                              ),
                              const Spacer(),
                              Text(
                                '${list.length} produk',
                                style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Search bar
            SliverPersistentHeader(
              pinned: true,
              delegate: _SearchBarDelegate(
                child: Container(
                  color: const Color(0xFFF5F5F5),
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                  child: TextField(
                    controller: _searchC,
                    onChanged: (_) => setState(() {}),
                    decoration: InputDecoration(
                      hintText: 'Cari produk, petani...',
                      hintStyle: TextStyle(color: Colors.grey[400]),
                      prefixIcon: const Icon(Icons.search, color: Color(0xFF2E7D32)),
                      suffixIcon: _searchC.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 20),
                              onPressed: () {
                                _searchC.clear();
                                setState(() {});
                              },
                            )
                          : null,
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ),
            ),

            // Kategori chips
            SliverToBoxAdapter(
              child: SizedBox(
                height: 46,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    _kategoriChip(null, 'Semua'),
                    ..._kategoriList.map((k) => _kategoriChip(k, k)),
                  ],
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 8)),

            // Product grid
            if (pp.isLoading)
              const SliverFillRemaining(
                child: Center(child: CircularProgressIndicator(color: Color(0xFF2E7D32))),
              )
            else if (list.isEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.search_off, size: 64, color: Colors.grey[300]),
                      const SizedBox(height: 12),
                      Text('Tidak ada produk ditemukan', style: TextStyle(color: Colors.grey[500], fontSize: 15)),
                    ],
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.72,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (_, i) => _productCard(list[i]),
                    childCount: list.length,
                  ),
                ),
              ),

            const SliverToBoxAdapter(child: SizedBox(height: 24)),
          ],
        ),
      ),
    );
  }

  Widget _kategoriChip(String? value, String label) {
    final selected = _selectedKategori == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => setState(() => _selectedKategori = value),
        backgroundColor: Colors.white,
        selectedColor: const Color(0xFF2E7D32).withOpacity(0.15),
        labelStyle: TextStyle(
          color: selected ? const Color(0xFF1B5E20) : Colors.grey[700],
          fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
          fontSize: 13,
        ),
        side: BorderSide(color: selected ? const Color(0xFF2E7D32) : Colors.grey.shade300),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
    );
  }

  Widget _productCard(Produk p) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => ProdukDetailScreen(produk: p)),
      ),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Photo
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: AspectRatio(
                aspectRatio: 1.2,
                child: p.fotoUrls.isNotEmpty
                    ? Image.network(
                        p.fotoUrls.first,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _placeholderImage(),
                      )
                    : _placeholderImage(),
              ),
            ),

            // Info
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      p.namaProduk,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    if (p.namaUsaha != null || p.lokasi != null)
                      Text(
                        p.namaUsaha ?? p.lokasi ?? '',
                        style: TextStyle(color: Colors.grey[500], fontSize: 11),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    const Spacer(),
                    Row(
                      children: [
                        Text(
                          'Rp ${p.hargaPerKg.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            color: Color(0xFF2E7D32),
                          ),
                        ),
                        Text('/kg', style: TextStyle(color: Colors.grey[500], fontSize: 11)),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Stok: ${p.stokKg.toStringAsFixed(0)} kg',
                      style: TextStyle(color: Colors.grey[500], fontSize: 11),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _placeholderImage() => Container(
        color: const Color(0xFFE8F5E9),
        child: const Center(child: Icon(Icons.eco, size: 40, color: Color(0xFF81C784))),
      );
}

class _SearchBarDelegate extends SliverPersistentHeaderDelegate {
  final Widget child;
  _SearchBarDelegate({required this.child});

  @override
  double get minExtent => 68;
  @override
  double get maxExtent => 68;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) => child;

  @override
  bool shouldRebuild(covariant _SearchBarDelegate oldDelegate) => false;
}
