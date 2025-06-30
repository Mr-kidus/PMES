import express from 'express';
import Notify from '../models/notifyModel.js';
const notifyRouter = express.Router();

// GET: Fetch user notifications
notifyRouter.get('/:userId', async (req, res) => {
  try {
    const notifications = await Notify.find({ recipientId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
});

// PUT: Mark notification as read
notifyRouter.put('/mark-read/:id', async (req, res) => {
  try {
    const notify = await Notify.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(notify);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update notification.' });
  }
});

// PUT: Mark all as read for a user
notifyRouter.put('/mark-all-read/:userId', async (req, res) => {
  try {
    await Notify.updateMany({ recipientId: req.params.userId, isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update notifications.' });
  }
});

export default notifyRouter;
