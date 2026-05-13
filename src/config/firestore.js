const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

module.exports = firestore;
