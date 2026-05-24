const { Firestore } = require('@google-cloud/firestore');
const path = require('path');
const fs = require('fs');

// Path ke service account key (untuk development lokal)
const keyFilePath = path.join(__dirname, '../../serviceAccountKey.json');

// Config: pakai key file di lokal, ADC (default service account) di Cloud Run
const config = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  databaseId: 'project-tcc06',
};

// Hanya pakai keyFilename jika file ada (lokal development)
if (fs.existsSync(keyFilePath)) {
  config.keyFilename = keyFilePath;
}

const firestore = new Firestore(config);

module.exports = firestore;
