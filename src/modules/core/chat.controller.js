const firestore = require('../../config/firestore');
const db = require('../../config/mysql');

// =============================================
// Chat Controller - Negosiasi Harga via Firestore
// =============================================

// Helper: get user full info from DB
const getUserInfo = async (userId) => {
  const [users] = await db.query(
    `SELECT u.id, u.nama, u.role, p.id as petani_id, pb.id as pembeli_id
     FROM users u
     LEFT JOIN petani p ON p.user_id = u.id
     LEFT JOIN pembeli pb ON pb.user_id = u.id
     WHERE u.id = ?`,
    [userId]
  );
  return users[0] || null;
};

// GET /chat/rooms - List chat rooms milik user
exports.getRooms = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Cari rooms dimana user adalah pembeli atau petani
    const pembeliRooms = await firestore.collection('chat_rooms')
      .where('pembeli_user_id', '==', userId)
      .get();

    const petaniRooms = await firestore.collection('chat_rooms')
      .where('petani_user_id', '==', userId)
      .get();

    const rooms = [];
    const seenIds = new Set();

    const processDoc = (doc) => {
      if (!seenIds.has(doc.id)) {
        seenIds.add(doc.id);
        const data = doc.data();
        rooms.push({
          id: doc.id,
          ...data,
          last_message_time: data.last_message_time?.toDate?.() || data.last_message_time,
          created_at: data.created_at?.toDate?.() || data.created_at,
        });
      }
    };

    pembeliRooms.forEach(processDoc);
    petaniRooms.forEach(processDoc);

    // Sort by last_message_time desc
    rooms.sort((a, b) => {
      const ta = new Date(a.last_message_time || 0);
      const tb = new Date(b.last_message_time || 0);
      return tb - ta;
    });

    res.json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

// POST /chat/rooms - Create or get existing chat room
exports.createRoom = async (req, res, next) => {
  try {
    const { produk_id, petani_id, petani_user_id, nama_petani, nama_produk, harga_asli } = req.body;
    const userId = req.user.id;

    // Get user info from DB
    const userInfo = await getUserInfo(userId);
    if (!userInfo) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    const pembeliId = userInfo.pembeli_id;
    const namaPembeli = userInfo.nama;

    if (!produk_id || !petani_user_id) {
      return res.status(400).json({ success: false, message: 'produk_id dan petani_user_id wajib diisi' });
    }

    const roomId = `produk_${produk_id}_pembeli_${pembeliId || userId}`;
    const roomRef = firestore.collection('chat_rooms').doc(roomId);
    const roomDoc = await roomRef.get();

    if (roomDoc.exists) {
      const data = roomDoc.data();
      return res.json({
        success: true,
        data: {
          id: roomId,
          ...data,
          last_message_time: data.last_message_time?.toDate?.() || data.last_message_time,
          created_at: data.created_at?.toDate?.() || data.created_at,
        },
      });
    }

    const roomData = {
      produk_id,
      pembeli_id: pembeliId || null,
      pembeli_user_id: userId,
      petani_id: petani_id || null,
      petani_user_id,
      nama_pembeli: namaPembeli,
      nama_petani: nama_petani || 'Petani',
      nama_produk: nama_produk || '',
      harga_asli: harga_asli || 0,
      agreed_price: null,
      last_message: '',
      last_message_time: new Date(),
      created_at: new Date(),
    };

    await roomRef.set(roomData);

    res.status(201).json({ success: true, data: { id: roomId, ...roomData } });
  } catch (error) {
    next(error);
  }
};

// GET /chat/rooms/:roomId/messages - Get messages in a room
exports.getMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Verify user belongs to this room
    const roomDoc = await firestore.collection('chat_rooms').doc(roomId).get();
    if (!roomDoc.exists) {
      return res.status(404).json({ success: false, message: 'Chat room tidak ditemukan' });
    }

    const room = roomDoc.data();
    if (room.pembeli_user_id !== userId && room.petani_user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke chat ini' });
    }

    const messagesSnap = await firestore.collection('chat_rooms').doc(roomId)
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .get();

    const messages = [];
    messagesSnap.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || data.timestamp,
      });
    });

    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

// POST /chat/rooms/:roomId/messages - Send a message
exports.sendMessage = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { message, type, offered_price } = req.body;
    const userId = req.user.id;

    // Verify user belongs to this room
    const roomDoc = await firestore.collection('chat_rooms').doc(roomId).get();
    if (!roomDoc.exists) {
      return res.status(404).json({ success: false, message: 'Chat room tidak ditemukan' });
    }

    const room = roomDoc.data();
    if (room.pembeli_user_id !== userId && room.petani_user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke chat ini' });
    }

    const senderRole = room.petani_user_id === userId ? 'petani' : 'pembeli';
    const senderName = senderRole === 'petani' ? room.nama_petani : room.nama_pembeli;

    const msgData = {
      sender_id: userId,
      sender_name: senderName,
      sender_role: senderRole,
      message: message || '',
      type: type || 'text',
      offered_price: offered_price || null,
      timestamp: new Date(),
    };

    const msgRef = await firestore.collection('chat_rooms').doc(roomId)
      .collection('messages').add(msgData);

    // Update last message in room
    const updateData = {
      last_message: message || (type === 'price_offer' ? `Tawaran harga: Rp ${offered_price}` : ''),
      last_message_time: new Date(),
    };

    // Jika petani menerima harga (type = price_accepted)
    if (type === 'price_accepted' && senderRole === 'petani' && offered_price) {
      updateData.agreed_price = offered_price;
    }

    await firestore.collection('chat_rooms').doc(roomId).update(updateData);

    res.status(201).json({
      success: true,
      data: { id: msgRef.id, ...msgData },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /chat/rooms/:roomId/accept-price - Petani accepts a price
exports.acceptPrice = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { price } = req.body;
    const userId = req.user.id;

    const roomDoc = await firestore.collection('chat_rooms').doc(roomId).get();
    if (!roomDoc.exists) {
      return res.status(404).json({ success: false, message: 'Chat room tidak ditemukan' });
    }

    const room = roomDoc.data();
    if (room.petani_user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Hanya petani yang bisa menyetujui harga' });
    }

    // Update agreed_price
    await firestore.collection('chat_rooms').doc(roomId).update({
      agreed_price: price,
      last_message: `✅ Harga deal: Rp ${Number(price).toLocaleString('id-ID')}/kg`,
      last_message_time: new Date(),
    });

    // Add system message
    await firestore.collection('chat_rooms').doc(roomId).collection('messages').add({
      sender_id: userId,
      sender_name: room.nama_petani,
      sender_role: 'petani',
      message: `✅ Harga deal disetujui: Rp ${Number(price).toLocaleString('id-ID')}/kg`,
      type: 'price_accepted',
      offered_price: price,
      timestamp: new Date(),
    });

    res.json({ success: true, message: 'Harga berhasil disetujui', agreed_price: price });
  } catch (error) {
    next(error);
  }
};

// GET /chat/rooms/:roomId - Get single room detail
exports.getRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const roomDoc = await firestore.collection('chat_rooms').doc(roomId).get();
    if (!roomDoc.exists) {
      return res.status(404).json({ success: false, message: 'Chat room tidak ditemukan' });
    }

    const room = roomDoc.data();
    if (room.pembeli_user_id !== userId && room.petani_user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke chat ini' });
    }

    res.json({
      success: true,
      data: {
        id: roomId,
        ...room,
        last_message_time: room.last_message_time?.toDate?.() || room.last_message_time,
        created_at: room.created_at?.toDate?.() || room.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};
