// backend/controllers/notification.controller.js
import Notification from '../models/Notification.model.js';
import { emitNotificationToUser } from '../utils/socket.js';


// create + emit notification (internal use)
export const createAndEmitNotification = async (userId, title, body, link = null, data = {}) => {
  const note = await Notification.create({
    user: userId,
    title,
    body,
    link,
    data
  });
  // emit to user socket room
  try {
    emitNotificationToUser(userId.toString(), {
      _id: note._id,
      title: note.title,
      body: note.body,
      link: note.link,
      data: note.data,
      read: note.read,
      createdAt: note.createdAt
    });
  } catch (e) {
    console.error("Emit notification error:", e);
  }
  return note;
};

// fetch notifications for logged in user
export const getMyNotifications = async (req, res) => {
  try {
    const notes = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate({ _id: id, user: req.user._id }, { read: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: "Error marking read" });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: "Error marking all read" });
  }
};
