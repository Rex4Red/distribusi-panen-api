import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/produk.dart';
import '../../providers/auth_provider.dart';
import '../../services/transaksi_service.dart';

class BuatPesananScreen extends StatefulWidget {
  final Produk produk;
  const BuatPesananScreen({super.key, required this.produk});

  @override
  State<BuatPesananScreen> createState() => _BuatPesananScreenState();
}

class _BuatPesananScreenState extends State<BuatPesananScreen> {
  final _jumlahC = TextEditingController(text: '1');
  bool _loading = false;

  double get _jumlah => double.tryParse(_jumlahC.text) ?? 0;
  double get _total => _jumlah * widget.produk.hargaPerKg;

  @override
  void dispose() {
    _jumlahC.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_jumlah <= 0) {
      _showSnack('Jumlah harus lebih dari 0', Colors.red);
      return;
    }
    if (_jumlah > widget.produk.stokKg) {
      _showSnack('Jumlah melebihi stok tersedia', Colors.red);
      return;
    }

    final auth = context.read<AuthProvider>();
    final pembeliId = auth.user?.pembeli?.id;
    if (pembeliId == null) {
      _showSnack('Data pembeli tidak ditemukan', Colors.red);
      return;
    }

    setState(() => _loading = true);
    try {
      await TransaksiService.create(
        token: auth.token!,
        pembeliId: pembeliId,
        produkId: widget.produk.id,
        jumlahKg: _jumlah,
      );
      if (!mounted) return;
      _showSnack('Pesanan berhasil dibuat! 🎉', const Color(0xFF2E7D32));
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      _showSnack(e.toString().replaceFirst('Exception: ', ''), Colors.red);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showSnack(String msg, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.produk;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('Buat Pesanan'),
        backgroundColor: const Color(0xFF2E7D32),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product summary card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: _card(),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: SizedBox(
                      width: 70,
                      height: 70,
                      child: p.fotoUrls.isNotEmpty
                          ? Image.network(p.fotoUrls.first, fit: BoxFit.cover, errorBuilder: (_, __, ___) => _img())
                          : _img(),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(p.namaProduk, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        const SizedBox(height: 4),
                        Text(
                          'Rp ${p.hargaPerKg.toStringAsFixed(0)} /kg',
                          style: const TextStyle(color: Color(0xFF2E7D32), fontWeight: FontWeight.w600, fontSize: 14),
                        ),
                        Text(
                          'Stok: ${p.stokKg.toStringAsFixed(0)} kg',
                          style: TextStyle(color: Colors.grey[500], fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Jumlah input
            Container(
              padding: const EdgeInsets.all(16),
              decoration: _card(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _sectionTitle('Jumlah Pembelian'),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _qtyButton(Icons.remove, () {
                        if (_jumlah > 1) {
                          _jumlahC.text = (_jumlah - 1).toStringAsFixed(0);
                          setState(() {});
                        }
                      }),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: _jumlahC,
                          keyboardType: TextInputType.number,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                          onChanged: (_) => setState(() {}),
                          decoration: InputDecoration(
                            suffixText: 'kg',
                            filled: true,
                            fillColor: const Color(0xFFF5F5F5),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      _qtyButton(Icons.add, () {
                        if (_jumlah < p.stokKg) {
                          _jumlahC.text = (_jumlah + 1).toStringAsFixed(0);
                          setState(() {});
                        }
                      }),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Summary
            Container(
              padding: const EdgeInsets.all(16),
              decoration: _card(),
              child: Column(
                children: [
                  _sectionTitle('Ringkasan Pesanan'),
                  const SizedBox(height: 16),
                  _summaryRow('Harga per kg', 'Rp ${p.hargaPerKg.toStringAsFixed(0)}'),
                  _summaryRow('Jumlah', '${_jumlah.toStringAsFixed(0)} kg'),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 10),
                    child: Divider(height: 1),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      Text(
                        'Rp ${_total.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                          color: Color(0xFF2E7D32),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Submit
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _loading ? null : _submit,
                icon: _loading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.send),
                label: Text(
                  _loading ? 'Memproses...' : 'Kirim Pesanan',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2E7D32),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _qtyButton(IconData icon, VoidCallback onPressed) => Container(
        decoration: BoxDecoration(
          color: const Color(0xFFE8F5E9),
          borderRadius: BorderRadius.circular(12),
        ),
        child: IconButton(
          onPressed: onPressed,
          icon: Icon(icon, color: const Color(0xFF2E7D32)),
        ),
      );

  Widget _summaryRow(String label, String value) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 14)),
            Text(value, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
          ],
        ),
      );

  BoxDecoration _card() => BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
      );

  Widget _sectionTitle(String t) => Row(
        children: [
          Container(width: 4, height: 18, decoration: BoxDecoration(color: const Color(0xFF2E7D32), borderRadius: BorderRadius.circular(2))),
          const SizedBox(width: 8),
          Text(t, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF1B5E20))),
        ],
      );

  Widget _img() => Container(
        color: const Color(0xFFE8F5E9),
        child: const Center(child: Icon(Icons.eco, size: 32, color: Color(0xFF81C784))),
      );
}
