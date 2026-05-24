const firestore = require('../../config/firestore');

// GET /logistik/status
exports.getDashboard = async (req, res, next) => {
  try {
    const snapshot = await firestore.collection('status_logistik').get();

    const data = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    // Hitung summary
    const summary = {
      total: data.length,
      diproses: data.filter(d => d.status === 'diproses').length,
      dalam_perjalanan: data.filter(d => d.status === 'dalam_perjalanan').length,
      terkirim: data.filter(d => d.status === 'terkirim').length,
    };

    res.json({ success: true, data, summary });
  } catch (error) {
    next(error);
  }
};

// GET /notifikasi
exports.getNotifikasi = async (req, res, next) => {
  try {
    let snapshot;
    try {
      snapshot = await firestore
        .collection('notifikasi')
        .where('user_id', '==', req.user.id)
        .orderBy('created_at', 'desc')
        .limit(20)
        .get();
    } catch (indexError) {
      // Fallback jika composite index belum dibuat
      snapshot = await firestore
        .collection('notifikasi')
        .where('user_id', '==', req.user.id)
        .limit(20)
        .get();
    }

    const data = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
