import Notification from "../models/notificationModel.js";
import User from "../models/userModels.js"; 

export const createNotification = async (req, res) => {
    try {
        const { title, message, email } = req.body; 

        if (!title || !message || !email) {
            return res.status(400).json({ error: "All fields are required." });
        }

        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

    
        const notification = new Notification({ title, message, userId: user._id });
        await notification.save();

        res.status(201).json({ message: "Notification created successfully.", notification });
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}
export const getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};


export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByIdAndDelete(id);

        if (!notification) {
            return res.status(404).json({ error: "Notification not found." });
        }

        res.status(200).json({ message: "Notification deleted successfully." });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};