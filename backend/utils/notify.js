import Notify from '../models/notifyModel.js';

export const sendNotification = async ({
  recipientId,
  senderId,
  senderName,
  title,
  module,
  message,
  referenceType,
  referenceId,
}) => {
  try {
    const notification = new Notify({
      recipientId,
      senderId,
      senderName,
      title,
      module,
      message,
      referenceType,
      referenceId,
    });
    await notification.save();
  } catch (error) {
    console.error('Notification error:', error);
  }
};
