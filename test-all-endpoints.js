// =============================================
// TEST ALL 23 ENDPOINTS (FIXED)
// =============================================

const BASE = 'http://localhost:3000';
let TOKEN = '';
let TEST_EMAIL = `test_${Date.now()}@test.com`;
let PETANI_ID = 1;
let PRODUK_ID = '';
let TRANSAKSI_ID = '';
let PEMBAYARAN_ID = '';
let PENGIRIMAN_ID = '';
let passed = 0;
let failed = 0;

async function request(method, path, body = null, useToken = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (useToken && TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${BASE}${path}`, options);
  const text = await res.text();
  try {
    return { status: res.status, data: JSON.parse(text) };
  } catch {
    return { status: res.status, data: { success: false, message: text.substring(0, 100) } };
  }
}

function log(num, name, success, detail = '') {
  const icon = success ? '✅' : '❌';
  if (success) passed++; else failed++;
  console.log(`${icon} [${num}/23] ${name} ${detail}`);
  if (!success && detail) console.log(`   →`, typeof detail === 'object' ? JSON.stringify(detail).substring(0, 200) : detail);
}

async function runTests() {
  console.log('🧪 Testing All 23 Endpoints...\n');

  // ═══ AUTH ═══
  console.log('── AUTH ──────────────────────────');

  // 1. Register
  try {
    const r = await request('POST', '/auth/register', {
      nama: 'Test Admin', email: TEST_EMAIL, password: 'test123456', role: 'admin',
    }, false);
    const ok = r.status === 201 && r.data.success;
    if (ok) TOKEN = r.data.data.token;
    log(1, 'POST /auth/register', ok);
  } catch (e) { log(1, 'POST /auth/register', false, e.message); }

  // 2. Login (pakai user yang baru register)
  try {
    const r = await request('POST', '/auth/login', {
      email: TEST_EMAIL, password: 'test123456',
    }, false);
    const ok = r.status === 200 && r.data.success;
    if (ok) TOKEN = r.data.data.token;
    log(2, 'POST /auth/login', ok);
  } catch (e) { log(2, 'POST /auth/login', false, e.message); }

  // 3. Get Profile
  try {
    const r = await request('GET', '/auth/profile');
    log(3, 'GET /auth/profile', r.status === 200 && r.data.success);
  } catch (e) { log(3, 'GET /auth/profile', false, e.message); }

  // 4. Update Profile
  try {
    const r = await request('PUT', '/auth/profile', { nama: 'Test Updated' });
    log(4, 'PUT /auth/profile', r.status === 200 && r.data.success);
  } catch (e) { log(4, 'PUT /auth/profile', false, e.message); }

  // ═══ PETANI ═══
  console.log('\n── PETANI ───────────────────────');

  // 5. Get All Petani
  try {
    const r = await request('GET', '/petani');
    const ok = r.status === 200 && r.data.success;
    if (ok && r.data.data.length > 0) PETANI_ID = r.data.data[0].id;
    log(5, 'GET /petani', ok, `(${r.data.data?.length || 0} records)`);
  } catch (e) { log(5, 'GET /petani', false, e.message); }

  // 6. Get Petani by ID
  try {
    const r = await request('GET', `/petani/${PETANI_ID}`);
    log(6, `GET /petani/${PETANI_ID}`, r.status === 200 && r.data.success);
  } catch (e) { log(6, 'GET /petani/:id', false, e.message); }

  // ═══ PRODUK ═══
  console.log('\n── PRODUK ───────────────────────');

  // 7. Create Produk
  try {
    const r = await request('POST', '/produk', {
      petani_id: PETANI_ID, nama_produk: 'TEST Jagung', kategori: 'Sayuran',
      harga_per_kg: 12000, stok_kg: 100, deskripsi: 'Test', status: 'tersedia',
    });
    const ok = r.status === 201 && r.data.success;
    if (ok) PRODUK_ID = r.data.data.id;
    log(7, 'POST /produk', ok);
  } catch (e) { log(7, 'POST /produk', false, e.message); }

  // 8. Get All Produk
  try {
    const r = await request('GET', '/produk');
    log(8, 'GET /produk', r.status === 200 && r.data.success, `(${r.data.data?.length || 0} records)`);
  } catch (e) { log(8, 'GET /produk', false, e.message); }

  // 9. Search Produk
  try {
    const r = await request('GET', '/produk?search=Jagung');
    log(9, 'GET /produk?search=Jagung', r.status === 200 && r.data.success, `(${r.data.data?.length || 0} results)`);
  } catch (e) { log(9, 'GET /produk?search', false, e.message); }

  // 10. Update Produk
  try {
    const r = await request('PUT', `/produk/${PRODUK_ID}`, { harga_per_kg: 15000 });
    log(10, `PUT /produk/${PRODUK_ID}`, r.status === 200 && r.data.success);
  } catch (e) { log(10, 'PUT /produk/:id', false, e.message); }

  // ═══ TRANSAKSI ═══
  console.log('\n── TRANSAKSI ────────────────────');

  // 11. Create Transaksi
  try {
    const r = await request('POST', '/transaksi', {
      pembeli_id: 1, produk_id: PRODUK_ID, jumlah_kg: 5,
    });
    const ok = r.status === 201 && r.data.success;
    if (ok) TRANSAKSI_ID = r.data.data.id;
    log(11, 'POST /transaksi', ok);
  } catch (e) { log(11, 'POST /transaksi', false, e.message); }

  // 12. Get All Transaksi
  try {
    const r = await request('GET', '/transaksi');
    log(12, 'GET /transaksi', r.status === 200 && r.data.success, `(${r.data.data?.length || 0} records)`);
  } catch (e) { log(12, 'GET /transaksi', false, e.message); }

  // 13. Get Transaksi by ID
  try {
    const r = await request('GET', `/transaksi/${TRANSAKSI_ID}`);
    log(13, `GET /transaksi/${TRANSAKSI_ID}`, r.status === 200 && r.data.success);
  } catch (e) { log(13, 'GET /transaksi/:id', false, e.message); }

  // 14. Update Transaksi
  try {
    const r = await request('PUT', `/transaksi/${TRANSAKSI_ID}`, { status: 'dikonfirmasi' });
    log(14, `PUT /transaksi/${TRANSAKSI_ID}`, r.status === 200 && r.data.success);
  } catch (e) { log(14, 'PUT /transaksi/:id', false, e.message); }

  // ═══ PEMBAYARAN ═══
  console.log('\n── PEMBAYARAN ───────────────────');

  // 15. Create Pembayaran
  try {
    const r = await request('POST', '/pembayaran', {
      transaksi_id: TRANSAKSI_ID, metode: 'transfer', jumlah: 75000,
    });
    const ok = r.status === 201 && r.data.success;
    if (ok) PEMBAYARAN_ID = r.data.data.id;
    log(15, 'POST /pembayaran', ok);
  } catch (e) { log(15, 'POST /pembayaran', false, e.message); }

  // 16. Get Pembayaran
  try {
    const r = await request('GET', `/pembayaran/${PEMBAYARAN_ID}`);
    log(16, `GET /pembayaran/${PEMBAYARAN_ID}`, r.status === 200 && r.data.success);
  } catch (e) { log(16, 'GET /pembayaran/:id', false, e.message); }

  // ═══ PENGIRIMAN ═══
  console.log('\n── PENGIRIMAN ───────────────────');

  // 17. Create Pengiriman
  try {
    const r = await request('POST', '/pengiriman', {
      transaksi_id: TRANSAKSI_ID, alamat_asal: 'Sleman', alamat_tujuan: 'Kota Yogya',
      kurir: 'JNE', estimasi: '2-3 hari',
    });
    const ok = r.status === 201 && r.data.success;
    if (ok) PENGIRIMAN_ID = r.data.data.id;
    log(17, 'POST /pengiriman', ok);
  } catch (e) { log(17, 'POST /pengiriman', false, e.message); }

  // 18. Get Pengiriman
  try {
    const r = await request('GET', `/pengiriman/${PENGIRIMAN_ID}`);
    log(18, `GET /pengiriman/${PENGIRIMAN_ID}`, r.status === 200 && r.data.success);
  } catch (e) { log(18, 'GET /pengiriman/:id', false, e.message); }

  // 19. Update Status Pengiriman
  try {
    const r = await request('PUT', `/pengiriman/${PENGIRIMAN_ID}/status`, { status: 'dalam_perjalanan' });
    log(19, `PUT /pengiriman/${PENGIRIMAN_ID}/status`, r.status === 200 && r.data.success);
  } catch (e) { log(19, 'PUT /pengiriman/:id/status', false, e.message); }

  // ═══ STOK REALTIME ═══
  console.log('\n── STOK REALTIME ────────────────');

  // 20. Update Stok (PUT /stok-realtime/:id)
  try {
    const r = await request('PUT', `/stok-realtime/${PRODUK_ID}`, {
      stok_kg: 95, nama_produk: 'TEST Jagung',
    });
    log(20, `PUT /stok-realtime/${PRODUK_ID}`, r.status === 200 && r.data.success);
  } catch (e) { log(20, 'PUT /stok-realtime/:id', false, e.message); }

  // 21. Get All Stok (GET /stok-realtime)
  try {
    const r = await request('GET', '/stok-realtime');
    log(21, 'GET /stok-realtime', r.status === 200 && r.data.success);
  } catch (e) { log(21, 'GET /stok-realtime', false, e.message); }

  // ═══ LOGISTIK DASHBOARD ═══
  console.log('\n── LOGISTIK DASHBOARD ───────────');

  // 22. Dashboard (GET /logistik/status)
  try {
    const r = await request('GET', '/logistik/status');
    log(22, 'GET /logistik/status', r.status === 200 && r.data.success);
  } catch (e) { log(22, 'GET /logistik/status', false, e.message); }

  // 23. Notifikasi (GET /notifikasi)
  try {
    const r = await request('GET', '/notifikasi');
    log(23, 'GET /notifikasi', r.status === 200 && r.data.success);
  } catch (e) { log(23, 'GET /notifikasi', false, e.message); }

  // ═══ CLEANUP ═══
  console.log('\n── CLEANUP ──────────────────────');
  try {
    await request('DELETE', `/produk/${PRODUK_ID}`);
    console.log(`🗑️  Cleaned up test produk`);
  } catch {}

  // ═══ SUMMARY ═══
  console.log('\n══════════════════════════════════');
  console.log(`📊 RESULT: ${passed}/${passed + failed} passed`);
  if (failed === 0) console.log('🎉 ALL ENDPOINTS WORKING!');
  else console.log(`⚠️  ${failed} endpoint(s) need fixing`);
  console.log('══════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => { console.error('Fatal:', err); process.exit(1); });
