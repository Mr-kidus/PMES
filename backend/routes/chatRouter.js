import express from "express";
import { dualBodyParser } from "../middlewares/dualBodyParser.js";
import {
  sendMessageToUser,
  getMessagesWithUser,
  markSeen,
  getUnreadCount,
  getUnreadCountPerUser,
  getRecentChats,
  createGroup,
  getGroupsForUser,
  sendGroupMessage,
  getGroupMessages,
  uploadChatFile,
  uploadGroupChatFile,
  leaveGroup,
  deleteGroup,
} from "../controllers/chatController.js";
import authUser from "../middlewares/authUser.js";
import {upload} from "../middlewares/multer.js";

const router = express.Router();

router.post("/send/:userId", authUser, dualBodyParser("file"), sendMessageToUser);
router.get("/messages/:userId", authUser, getMessagesWithUser);
router.post("/mark-seen/:userId", authUser, markSeen);
router.get("/unread", authUser, getUnreadCount);
router.get("/unread-counts", authUser, getUnreadCountPerUser);
router.get("/recent", authUser, getRecentChats);

router.post("/groups", authUser, createGroup);
router.get("/groups", authUser, getGroupsForUser);
router.post("/send-group/:groupId", authUser, dualBodyParser("file"), sendGroupMessage);
router.get("/group-messages/:groupId", authUser, getGroupMessages);

router.post("/upload-file", authUser, upload.single("file"), uploadChatFile);
router.post("/upload-group-file", authUser, upload.single("file"), uploadGroupChatFile);

router.post("/groups/:groupId/leave", authUser, leaveGroup);
router.delete("/groups/:groupId", authUser, deleteGroup);

export default router;
