import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:distribusi_panen_mobile/main.dart';

void main() {
  testWidgets('App renders splash screen', (WidgetTester tester) async {
    await tester.pumpWidget(const PanenKuApp());
    expect(find.text('PanenKu'), findsOneWidget);
  });
}
