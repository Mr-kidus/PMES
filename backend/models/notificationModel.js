import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        userId: { type: String, required: true },
    },
    { timestamps: true }
);


const Notification = mongoose.model('Notfication', notificationSchema);
export default Notification;
