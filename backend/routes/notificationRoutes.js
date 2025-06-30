import express from "express";
import {
  createNotification,
  getNotifications,
  deleteNotification,
} from "../controllers/notificationControllers.js";

const notificationRouter = express.Router();

notificationRouter.post("/create-notifications", createNotification);
notificationRouter.get("/get-notifications/:userId", getNotifications);
notificationRouter.delete("/delete-notifications/:id", deleteNotification);

export default notificationRouter;
