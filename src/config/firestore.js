const { Firestore } = require('@google-cloud/firestore');
const path = require('path');

// Path ke service account key yang didownload dari GCP Console
const keyFilePath = path.join(__dirname, '../../serviceAccountKey.json');

const firestore = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: keyFilePath,
  databaseId: 'project-tcc06', // Database ID yang dibuat di GCP Console
});

module.exports = firestore;
