// Script test koneksi Firestore
require('dotenv').config();
const { Firestore } = require('@google-cloud/firestore');
const path = require('path');

const firestore = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: path.join(__dirname, 'serviceAccountKey.json'),
  databaseId: 'project-tcc06',
});

async function testFirestore() {
  try {
    console.log('🔗 Testing Firestore connection...');
    console.log(`   Project ID: ${process.env.GOOGLE_CLOUD_PROJECT_ID}`);

    // Test write
    const testRef = firestore.collection('test_connection').doc('test_1');
    await testRef.set({
      message: 'Hello from distribusi-panen-api!',
      timestamp: new Date(),
      status: 'connected',
    });
    console.log('✅ Write berhasil!');

    // Test read
    const doc = await testRef.get();
    console.log('✅ Read berhasil:', doc.data());

    // Cleanup
    await testRef.delete();
    console.log('✅ Delete berhasil!');

    console.log('\n🎉 Firestore connection SUCCESS! Semua operasi berjalan.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Firestore connection FAILED:', error.message);
    process.exit(1);
  }
}

testFirestore();
