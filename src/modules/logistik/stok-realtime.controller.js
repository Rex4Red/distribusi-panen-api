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
    const updateData = { updated_at: new Date() };
    
    // Hanya set field yang dikirim
    if (req.body.stok_kg !== undefined) updateData.stok_kg = req.body.stok_kg;
    if (req.body.harga_per_kg !== undefined) updateData.harga_per_kg = req.body.harga_per_kg;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.nama_produk !== undefined) updateData.nama_produk = req.body.nama_produk;

    await firestore.collection('realtime_stok').doc(String(req.params.id)).set(updateData, { merge: true });

    res.json({ success: true, message: 'Stok realtime berhasil diupdate' });
  } catch (error) {
    next(error);
  }
};
