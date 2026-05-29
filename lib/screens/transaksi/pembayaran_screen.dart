import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/transaksi.dart';
import '../../providers/auth_provider.dart';
import '../../services/transaksi_service.dart';

class PembayaranScreen extends StatefulWidget {
  final Transaksi transaksi;
  const PembayaranScreen({super.key, required this.transaksi});

  @override
  State<PembayaranScreen> createState() => _PembayaranScreenState();
}

class _PembayaranScreenState extends State<PembayaranScreen> {
  final TransaksiService _service = TransaksiService();
  String? _selectedMetode;
  bool _loading = false;
  bool _success = false;

  final List<_MetodePembayaran> _metodes = [
    _MetodePembayaran(
      key: 'transfer',
      label: 'Transfer Bank',
      icon: Icons.account_balance,
      color: Color(0xFF1565C0),
      desc: 'BCA / BNI / Mandiri',
      detail: 'No. Rek: 1234-5678-9012\nA/N: PT PanenKu Indonesia',
    ),
    _MetodePembayaran(
      key: 'e-wallet',
      label: 'E-Wallet',
      icon: Icons.wallet,
      color: Color(0xFF00897B),
      desc: 'GoPay / OVO / DANA',
      detail: 'No. E-Wallet: 0812-3456-7890\nA/N: PanenKu',
    ),
    _MetodePembayaran(
      key: 'cod',
      label: 'COD',
      icon: Icons.handshake,
      color: Color(0xFFF57C00),
      desc: 'Bayar di Tempat',
      detail: 'Bayar langsung ke kurir saat barang diterima',
    ),
  ];

  Future<void> _bayar() async {
    if (_selectedMetode == null) return;

    setState(() => _loading = true);
    try {
      final token = context.read<AuthProvider>().token!;
      await _service.createPembayaran(
        token: token,
        transaksiId: widget.transaksi.id,
        metode: _selectedMetode!,
        jumlah: widget.transaksi.totalHarga,
      );
      if (!mounted) return;
      setState(() => _success = true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$e'), backgroundColor: Colors.red),
      );
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_success) return _buildSuccessScreen();

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('Pembayaran'),
        backgroundColor: const Color(0xFF2E7D32),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header — total bayar
            Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF2E7D32), Color(0xFF1B5E20)],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 28),
              child: Column(
                children: [
                  const Text('Total Pembayaran',
                      style: TextStyle(color: Colors.white70, fontSize: 13)),
                  const SizedBox(height: 6),
                  Text(
                    'Rp ${_formatCurrency(widget.transaksi.totalHarga)}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'Transaksi #${widget.transaksi.id} • ${widget.transaksi.namaProduk ?? "Produk"}',
                      style:
                          const TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Detail pesanan
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Detail Pesanan',
                        style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: Color(0xFF1B5E20))),
                    const SizedBox(height: 12),
                    _detailRow('Produk',
                        widget.transaksi.namaProduk ?? 'Produk'),
                    _detailRow('Jumlah',
                        '${widget.transaksi.jumlahKg.toStringAsFixed(0)} kg'),
                    _detailRow('Petani',
                        widget.transaksi.namaPetani ?? '-'),
                    const Divider(height: 20),
                    _detailRow(
                        'Total',
                        'Rp ${_formatCurrency(widget.transaksi.totalHarga)}',
                        bold: true),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Pilih metode
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.only(left: 4, bottom: 10),
                    child: Text('Pilih Metode Pembayaran',
                        style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: Color(0xFF1B5E20))),
                  ),
                  ..._metodes.map((m) => _metodeCard(m)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Info detail metode terpilih
            if (_selectedMetode != null)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF8E1),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                        color: const Color(0xFFF57C00).withOpacity(0.3)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.info_outline,
                          color: Color(0xFFF57C00), size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _metodes
                              .firstWhere((m) => m.key == _selectedMetode)
                              .detail,
                          style: const TextStyle(
                              fontSize: 13, color: Color(0xFF5D4037)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 24),

            // Tombol bayar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed:
                      (_selectedMetode != null && !_loading) ? _bayar : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2E7D32),
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: Colors.grey[300],
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: _loading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                              strokeWidth: 2.5, color: Colors.white))
                      : const Text('Konfirmasi Pembayaran',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSuccessScreen() {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: const Color(0xFF2E7D32).withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check_circle,
                      color: Color(0xFF2E7D32), size: 60),
                ),
                const SizedBox(height: 24),
                const Text('Pembayaran Berhasil!',
                    style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1B5E20))),
                const SizedBox(height: 8),
                Text(
                  'Pembayaran Rp ${_formatCurrency(widget.transaksi.totalHarga)} via ${_metodes.firstWhere((m) => m.key == _selectedMetode).label}',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                ),
                const SizedBox(height: 8),
                Text('Transaksi #${widget.transaksi.id}',
                    style: TextStyle(fontSize: 13, color: Colors.grey[500])),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).pop(true); // return true = success
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2E7D32),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                      elevation: 0,
                    ),
                    child: const Text('Kembali ke Pesanan',
                        style: TextStyle(
                            fontSize: 15, fontWeight: FontWeight.w600)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _metodeCard(_MetodePembayaran m) {
    final selected = _selectedMetode == m.key;
    return GestureDetector(
      onTap: () => setState(() => _selectedMetode = m.key),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? m.color.withOpacity(0.06) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: selected ? m.color : Colors.grey.withOpacity(0.15),
            width: selected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: m.color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(m.icon, color: m.color, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(m.label,
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                          color: selected ? m.color : Colors.black87)),
                  Text(m.desc,
                      style:
                          TextStyle(fontSize: 12, color: Colors.grey[500])),
                ],
              ),
            ),
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: selected ? m.color : Colors.transparent,
                border: Border.all(
                    color: selected ? m.color : Colors.grey[300]!,
                    width: 2),
              ),
              child: selected
                  ? const Icon(Icons.check, color: Colors.white, size: 16)
                  : null,
            ),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value, {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          Text(value,
              style: TextStyle(
                  fontWeight: bold ? FontWeight.bold : FontWeight.w500,
                  fontSize: 13,
                  color: bold ? const Color(0xFF1B5E20) : Colors.black87)),
        ],
      ),
    );
  }

  String _formatCurrency(double value) {
    final s = value.toStringAsFixed(0);
    final result = StringBuffer();
    int count = 0;
    for (int i = s.length - 1; i >= 0; i--) {
      result.write(s[i]);
      count++;
      if (count % 3 == 0 && i != 0) result.write('.');
    }
    return result.toString().split('').reversed.join();
  }
}

class _MetodePembayaran {
  final String key;
  final String label;
  final IconData icon;
  final Color color;
  final String desc;
  final String detail;

  const _MetodePembayaran({
    required this.key,
    required this.label,
    required this.icon,
    required this.color,
    required this.desc,
    required this.detail,
  });
}
