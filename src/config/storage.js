const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

// Path ke service account key (sama dengan Firestore)
const keyFilePath = path.join(__dirname, '../../serviceAccountKey.json');

// Config: pakai key file di lokal, ADC (default service account) di Cloud Run
const config = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
};

// Hanya pakai keyFilename jika file ada (lokal development)
if (fs.existsSync(keyFilePath)) {
  config.keyFilename = keyFilePath;
}

const storage = new Storage(config);
const bucketName = process.env.GCS_BUCKET_NAME || `${process.env.GOOGLE_CLOUD_PROJECT_ID}-foto-produk`;
const bucket = storage.bucket(bucketName);

module.exports = { storage, bucket, bucketName };
