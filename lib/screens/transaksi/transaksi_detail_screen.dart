import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/transaksi_service.dart';
import '../../models/transaksi.dart';
import 'pembayaran_screen.dart';

class TransaksiDetailScreen extends StatefulWidget {
  final Transaksi transaksi;
  const TransaksiDetailScreen({super.key, required this.transaksi});
  @override
  State<TransaksiDetailScreen> createState() => _TransaksiDetailScreenState();
}

class _TransaksiDetailScreenState extends State<TransaksiDetailScreen> {
  final TransaksiService _service = TransaksiService();
  late Transaksi _t;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _t = widget.transaksi;
  }

  Future<void> _refreshData() async {
    try {
      final token = context.read<AuthProvider>().token!;
      _t = await _service.getById(token, _t.id);
      if (mounted) setState(() {});
    } catch (_) {}
  }

  Future<void> _updateStatus(String status) async {
    setState(() => _loading = true);
    try {
      final token = context.read<AuthProvider>().token!;
      await _service.updateStatus(token, _t.id, status);
      _t = await _service.getById(token, _t.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Status diupdate ke $status'),
        backgroundColor: const Color(0xFF2E7D32),
        behavior: SnackBarBehavior.floating,
      ));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$e'), backgroundColor: Colors.red));
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final role = context.read<AuthProvider>().role;
    final isPetani = role == 'petani';
    final isPembeli = role == 'pembeli';

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: Text('Transaksi #${_t.id}'),
        backgroundColor: const Color(0xFF2E7D32),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // === STEPPER TIMELINE ===
            _buildTimeline(),
            const SizedBox(height: 20),

            // === Detail Pesanan ===
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Detail Pesanan',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Color(0xFF1B5E20))),
                  const SizedBox(height: 16),
                  _row('Produk', _t.namaProduk ?? '#${_t.produkId}'),
                  _row('Pembeli', _t.namaPembeli ?? '#${_t.pembeliId}'),
                  _row('Petani', _t.namaPetani ?? '#${_t.petaniId}'),
                  _row('Jumlah', '${_t.jumlahKg.toStringAsFixed(0)} kg'),
                  _row('Total Harga',
                      'Rp ${_formatCurrency(_t.totalHarga)}'),
                  if (_t.createdAt != null)
                    _row('Tanggal', _t.createdAt!.substring(0, 10)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // === Info Pembayaran ===
            if (_t.sudahBayar)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.payment,
                            color: Color(0xFF7B1FA2), size: 20),
                        const SizedBox(width: 8),
                        const Text('Info Pembayaran',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                                color: Color(0xFF7B1FA2))),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _row('Metode', _t.metode ?? '-'),
                    _row('Jumlah',
                        'Rp ${_formatCurrency(_t.jumlahPembayaran ?? 0)}'),
                    _row('Status',
                        (_t.statusPembayaran ?? '-').toUpperCase()),
                  ],
                ),
              ),

            const SizedBox(height: 24),

            // === PAYMENT GATEWAY BUTTON (Pembeli only) ===
            if (isPembeli && _t.perluBayar)
              Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 12),
                child: ElevatedButton.icon(
                  onPressed: _loading ? null : _goToPayment,
                  icon: const Icon(Icons.payment, size: 22),
                  label: const Text('Bayar Sekarang',
                      style: TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 16)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF7B1FA2),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                ),
              ),

            // === ACTION BUTTONS ===
            // PETANI: Konfirmasi / Tolak saat pending
            if (isPetani && _t.status == 'pending') ...[
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed:
                      _loading ? null : () => _updateStatus('dikonfirmasi'),
                  icon: const Icon(Icons.check_circle_outline),
                  label: const Text('Konfirmasi Pesanan',
                      style: TextStyle(fontWeight: FontWeight.w600)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2E7D32),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: OutlinedButton.icon(
                  onPressed:
                      _loading ? null : () => _updateStatus('dibatalkan'),
                  icon: const Icon(Icons.cancel_outlined),
                  label: const Text('Tolak Pesanan',
                      style: TextStyle(fontWeight: FontWeight.w600)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    side: const BorderSide(color: Colors.red),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
            ],
            // PETANI: Tandai dikirim saat dikonfirmasi
            if (isPetani && _t.status == 'dikonfirmasi')
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed:
                      _loading ? null : () => _updateStatus('dikirim'),
                  icon: const Icon(Icons.local_shipping_outlined),
                  label: const Text('Tandai Dikirim',
                      style: TextStyle(fontWeight: FontWeight.w600)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1565C0),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                ),
              ),
            // PEMBELI: Batalkan pesanan saat masih pending
            if (isPembeli && _t.status == 'pending')
              SizedBox(
                width: double.infinity,
                height: 50,
                child: OutlinedButton.icon(
                  onPressed:
                      _loading ? null : () => _updateStatus('dibatalkan'),
                  icon: const Icon(Icons.cancel_outlined),
                  label: const Text('Batalkan Pesanan',
                      style: TextStyle(fontWeight: FontWeight.w600)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    side: const BorderSide(color: Colors.red),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
            // PEMBELI: Konfirmasi diterima saat status dikirim
            if (isPembeli && _t.status == 'dikirim')
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed:
                      _loading ? null : () => _updateStatus('selesai'),
                  icon: const Icon(Icons.check_circle),
                  label: const Text('Konfirmasi Diterima',
                      style: TextStyle(fontWeight: FontWeight.w600)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2E7D32),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                ),
              ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  void _goToPayment() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
          builder: (_) => PembayaranScreen(transaksi: _t)),
    );
    if (result == true) {
      await _refreshData();
    }
  }

  // ============================================
  // TIMELINE / STEPPER WIDGET
  // ============================================

  Widget _buildTimeline() {
    final steps = [
      _TimelineStep(
        label: 'Pesanan Dibuat',
        icon: Icons.shopping_cart,
        status: _getStepStatus(0),
      ),
      _TimelineStep(
        label: 'Dikonfirmasi',
        icon: Icons.verified,
        status: _getStepStatus(1),
      ),
      _TimelineStep(
        label: 'Dibayar',
        icon: Icons.payment,
        status: _getStepStatus(2),
      ),
      _TimelineStep(
        label: 'Dikirim',
        icon: Icons.local_shipping,
        status: _getStepStatus(3),
      ),
      _TimelineStep(
        label: 'Selesai',
        icon: Icons.check_circle,
        status: _getStepStatus(4),
      ),
    ];

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(16)),
      child: Column(
        children: [
          const Text('Status Pesanan',
              style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: Color(0xFF1B5E20))),
          const SizedBox(height: 20),
          Row(
            children: List.generate(steps.length * 2 - 1, (index) {
              if (index.isEven) {
                final step = steps[index ~/ 2];
                return _buildStepCircle(step);
              } else {
                final prevStep = steps[(index - 1) ~/ 2];
                final isActive = prevStep.status == _StepStatus.completed;
                return Expanded(
                  child: Container(
                    height: 3,
                    decoration: BoxDecoration(
                      color: isActive
                          ? const Color(0xFF2E7D32)
                          : Colors.grey[300],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                );
              }
            }),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: steps.map((step) {
              Color textColor;
              switch (step.status) {
                case _StepStatus.completed:
                  textColor = const Color(0xFF2E7D32);
                  break;
                case _StepStatus.active:
                  textColor = const Color(0xFFF57C00);
                  break;
                default:
                  textColor = Colors.grey[400]!;
              }
              return SizedBox(
                width: 56,
                child: Text(
                  step.label,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      fontSize: 9,
                      fontWeight: step.status != _StepStatus.pending
                          ? FontWeight.w600
                          : FontWeight.normal,
                      color: textColor),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildStepCircle(_TimelineStep step) {
    Color bgColor;
    Color iconColor;
    double size;

    switch (step.status) {
      case _StepStatus.completed:
        bgColor = const Color(0xFF2E7D32);
        iconColor = Colors.white;
        size = 36;
        break;
      case _StepStatus.active:
        bgColor = const Color(0xFFF57C00);
        iconColor = Colors.white;
        size = 40;
        break;
      default:
        bgColor = Colors.grey[200]!;
        iconColor = Colors.grey[400]!;
        size = 32;
    }

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: bgColor,
        shape: BoxShape.circle,
        boxShadow: step.status == _StepStatus.active
            ? [
                BoxShadow(
                    color: bgColor.withOpacity(0.4),
                    blurRadius: 8,
                    offset: const Offset(0, 2))
              ]
            : null,
      ),
      child: Icon(step.icon, color: iconColor, size: size * 0.5),
    );
  }

  _StepStatus _getStepStatus(int stepIndex) {
    // Status mapping:
    // 0: Pesanan Dibuat — always completed (if transaction exists)
    // 1: Dikonfirmasi — completed if status >= dikonfirmasi
    // 2: Dibayar — completed if sudahBayar
    // 3: Dikirim — completed if status >= dikirim
    // 4: Selesai — completed if status == selesai

    final statusOrder = {
      'pending': 0,
      'dikonfirmasi': 1,
      'dikirim': 3,
      'selesai': 4,
      'dibatalkan': -1,
    };

    final currentLevel = statusOrder[_t.status] ?? 0;

    switch (stepIndex) {
      case 0: // Pesanan Dibuat
        if (_t.status == 'dibatalkan') return _StepStatus.completed;
        return currentLevel >= 0
            ? (currentLevel == 0
                ? _StepStatus.active
                : _StepStatus.completed)
            : _StepStatus.pending;
      case 1: // Dikonfirmasi
        if (_t.status == 'dibatalkan') return _StepStatus.pending;
        return currentLevel >= 1
            ? (currentLevel == 1
                ? _StepStatus.active
                : _StepStatus.completed)
            : _StepStatus.pending;
      case 2: // Dibayar
        if (_t.status == 'dibatalkan') return _StepStatus.pending;
        if (_t.sudahBayar) return _StepStatus.completed;
        if (currentLevel == 1) return _StepStatus.active; // perlu bayar
        return _StepStatus.pending;
      case 3: // Dikirim
        if (_t.status == 'dibatalkan') return _StepStatus.pending;
        return currentLevel >= 3
            ? (currentLevel == 3
                ? _StepStatus.active
                : _StepStatus.completed)
            : _StepStatus.pending;
      case 4: // Selesai
        if (_t.status == 'dibatalkan') return _StepStatus.pending;
        return currentLevel >= 4
            ? _StepStatus.completed
            : _StepStatus.pending;
      default:
        return _StepStatus.pending;
    }
  }

  Widget _row(String label, String value) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label,
                  style:
                      TextStyle(color: Colors.grey[600], fontSize: 14)),
              Flexible(
                child: Text(value,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 14),
                    textAlign: TextAlign.end),
              ),
            ]),
      );

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

enum _StepStatus { pending, active, completed }

class _TimelineStep {
  final String label;
  final IconData icon;
  final _StepStatus status;
  const _TimelineStep(
      {required this.label, required this.icon, required this.status});
}
