import mongoose from 'mongoose';

const notifySchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: { type: String, default: '' },

  title: { type: String, required: true },
  module: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },

  referenceType: { type: String, enum: ['plan', 'performance', 'measure'], required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Notify', notifySchema);
