/**
 * Script untuk generate bcrypt hash dari password plaintext.
 * Jalankan: node scripts/hash-passwords.js
 * 
 * Gunakan hasil hash ini untuk UPDATE di Cloud SQL Console
 * atau bisa langsung konek ke database.
 */
const bcrypt = require('bcryptjs');

const passwords = [
  { email: 'admin@panen.com', plain: 'admin123' },
  { email: 'budi@panen.com', plain: 'petani123' },
  { email: 'restoran@panen.com', plain: 'pembeli123' },
];

(async () => {
  console.log('=== BCRYPT HASH GENERATOR ===\n');
  
  for (const { email, plain } of passwords) {
    const hash = await bcrypt.hash(plain, 10);
    console.log(`Email   : ${email}`);
    console.log(`Password: ${plain}`);
    console.log(`Hash    : ${hash}`);
    console.log(`SQL     : UPDATE users SET password = '${hash}' WHERE email = '${email}';`);
    console.log('---');
  }
  
  console.log('\n✅ Copy SQL di atas, lalu jalankan di Cloud SQL Console.');
})();
