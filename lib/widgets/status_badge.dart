import 'package:flutter/material.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    IconData icon;

    switch (status.toLowerCase()) {
      case 'tersedia':
      case 'selesai':
      case 'terkirim':
      case 'berhasil':
        color = const Color(0xFF2E7D32);
        icon = Icons.check_circle_outline;
        break;
      case 'pending':
      case 'diproses':
        color = const Color(0xFFF57C00);
        icon = Icons.access_time;
        break;
      case 'dikonfirmasi':
      case 'dalam_perjalanan':
        color = const Color(0xFF1565C0);
        icon = Icons.local_shipping_outlined;
        break;
      case 'habis':
      case 'dibatalkan':
      case 'gagal':
      case 'ditolak':
        color = const Color(0xFFC62828);
        icon = Icons.cancel_outlined;
        break;
      case 'menunggu_verifikasi':
        color = const Color(0xFFEF6C00);
        icon = Icons.hourglass_top;
        break;
      case 'nonaktif':
        color = const Color(0xFF757575);
        icon = Icons.block;
        break;
      default:
        color = const Color(0xFF757575);
        icon = Icons.info_outline;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            status.replaceAll('_', ' ').toUpperCase(),
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}
