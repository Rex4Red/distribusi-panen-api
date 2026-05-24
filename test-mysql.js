// Script test koneksi MySQL (Cloud SQL)
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testMySQL() {
  try {
    console.log('🔗 Testing MySQL connection...');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   User: ${process.env.DB_USER}`);
    console.log(`   Database: ${process.env.DB_NAME}`);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      ssl: { rejectUnauthorized: false },
    });

    console.log('✅ Connected to MySQL!');

    // Test query - cek tabel
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n📋 Tabel yang ada (${tables.length}):`);
    tables.forEach(t => {
      const name = Object.values(t)[0];
      console.log(`   - ${name}`);
    });

    // Test query - cek data sample
    const [users] = await connection.query('SELECT id, nama, email, role FROM users');
    console.log(`\n👥 Users (${users.length}):`);
    users.forEach(u => console.log(`   - [${u.role}] ${u.nama} (${u.email})`));

    await connection.end();
    console.log('\n🎉 MySQL connection SUCCESS!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MySQL connection FAILED:', error.message);
    process.exit(1);
  }
}

testMySQL();
