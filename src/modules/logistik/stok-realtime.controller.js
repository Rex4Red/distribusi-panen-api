const firestore = require('../../config/firestore');

// GET /stok-realtime
exports.getAll = async (req, res, next) => {
  try {
    const snapshot = await firestore.collection('realtime_stok').get();

    const data = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// PUT /stok-realtime/:id
exports.update = async (req, res, next) => {
  try {
    const { stok_kg, harga_per_kg, status } = req.body;

    await firestore.collection('realtime_stok').doc(req.params.id).set({
      stok_kg,
      harga_per_kg,
      status,
      updated_at: new Date(),
    }, { merge: true });

    res.json({ success: true, message: 'Stok realtime berhasil diupdate' });
  } catch (error) {
    next(error);
  }
};
