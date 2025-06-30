import ChatMessage from "../models/ChatMessage.js";
import Group from "../models/Group.js";
import { io, onlineUsers } from "../server.js";
import path from "path";
import mongoose from "mongoose";
import fs from "fs";

// Send message to user (text or file)
export const sendMessageToUser = async (req, res) => {
  try {
    const { text } = req.body;
    const file = req.file;
    const userId = req.userId;
    const otherId = req.params.userId;

    const msg = await ChatMessage.create({
      from: userId,
      to: otherId,
      text,
      fileUrl: file ? `/uploads/${file.filename}` : null,
      fileName: file ? file.originalname : null,
      delivered: false,
      seen: false,
    });

    const populated = await ChatMessage.findById(msg._id).populate("from", "fullName email").lean();

    res.json({ ...populated, isMe: populated.from._id.toString() === userId });
  } catch (err) {
    console.error("sendMessageToUser error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Get all messages between auth user and other user, with full populated 'from'
export const getMessagesWithUser = async (req, res) => {
  const userId = req.userId;
  const otherId = req.params.userId;
  try {
    const messages = await ChatMessage.find({
      $or: [
        { from: userId, to: otherId },
        { from: otherId, to: userId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate("from", "fullName email")
      .select("from to text fileUrl fileName createdAt seen delivered group") // ⬅️ ensure file fields included
      .lean();

    await ChatMessage.updateMany(
      { from: otherId, to: userId, delivered: false },
      { $set: { delivered: true } }
    );

    res.json(messages.map(m => ({
      ...m,
      isMe: m.from._id.toString() === userId,
    })));
  } catch (err) {
    console.error("getMessagesWithUser error:", err);
    res.status(500).json({ error: "Failed to get messages" });
  }
};


export const markSeen = async (req, res) => {
  const userId = req.userId;
  const otherId = req.params.userId;
  await ChatMessage.updateMany(
    { from: otherId, to: userId, seen: false },
    { $set: { seen: true } }
  );
  res.json({ success: true });
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;
    const count = await ChatMessage.countDocuments({ to: userId, seen: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
};

export const getUnreadCountPerUser = async (req, res) => {
  const userId = req.userId;
  const result = await ChatMessage.aggregate([
    { $match: { to: userId, seen: false } },
    { $group: { _id: "$from", count: { $sum: 1 } } }
  ]);
  const counts = {};
  result.forEach(r => { counts[r._id.toString()] = r.count; });
  res.json(counts);
};

export const getRecentChats = async (req, res) => {
  const userId = req.userId;
  const messages = await ChatMessage.find({ $or: [{ from: userId }, { to: userId }] })
    .sort({ updatedAt: -1 })
    .populate("from", "fullName email")
    .populate("to", "fullName email")
    .lean();

  const users = [];
  const seen = new Set();

  messages.forEach(m => {
    if (!m.from || !m.to || !m.from._id || !m.to._id) return;
    const other = m.from._id.toString() === userId ? m.to : m.from;
    if (!seen.has(other._id.toString())) {
      users.push(other);
      seen.add(other._id.toString());
    }
  });

  res.json(users);
};

export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const owner = req.userId;
    if (!name || !members?.length) {
      return res.status(400).json({ error: "Name and members are required" });
    }

    const uniqueMembers = [...new Set([...members, owner])];

    const group = await Group.create({
      name,
      members: uniqueMembers,
      owner,
    });

    res.status(201).json(group);
  } catch (err) {
    console.error("createGroup error:", err);
    res.status(500).json({ error: "Failed to create group" });
  }
};

export const getGroupsForUser = async (req, res) => {
  try {
    const objectId = new mongoose.Types.ObjectId(req.userId);
    const groups = await Group.find({ members: objectId });
    res.json(groups);
  } catch (err) {
    console.error("getGroupsForUser error:", err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

// Send group message (text or file)
export const sendGroupMessage = async (req, res) => {
  try {
    const text = req.body.text;
    const file = req.file;
    const userId = req.userId;
    const groupId = req.params.groupId;

    const msg = await ChatMessage.create({
      from: userId,
      group: groupId,
      text,
      fileUrl: file ? `/uploads/${file.filename}` : null,
      fileName: file ? file.originalname : null,
      delivered: false,
      seen: false,
    });

    const populated = await ChatMessage.findById(msg._id).populate("from", "fullName email").lean();

    res.json({ ...populated, isMe: populated.from._id.toString() === userId });
  } catch (err) {
    console.error("sendGroupMessage error:", err);
    res.status(500).json({ error: "Failed to send group message" });
  }
};

// Get all messages for a group, with populated "from"
export const getGroupMessages = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.userId;
    const messages = await ChatMessage.find({ group: groupId })
      .sort({ createdAt: 1 })
      .populate("from", "fullName email")
      .select("from text fileUrl fileName createdAt group seen delivered") // ⬅️ include file fields
      .lean();

    res.json(messages.map(m => ({
      ...m,
      isMe: m.from._id.toString() === userId,
    })));
  } catch (err) {
    console.error("getGroupMessages error:", err);
    res.status(500).json({ error: "Failed to fetch group messages" });
  }
};


const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Upload a file for private chat
export const uploadChatFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ error: "Missing recipient user ID" });
    }

    const msg = await ChatMessage.create({
      from: req.userId,
      to, // ✅ Add this
      text: null,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      delivered: false,
      seen: false,
    });

    res.json({ ...msg.toObject(), isMe: true });
  } catch (err) {
    console.error("uploadChatFile error:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
};


// Upload a file for group chat
export const uploadGroupChatFile = async (req, res) => {
  try {
    const { groupId } = req.body;
    if (!req.file || !groupId) return res.status(400).json({ error: "Missing file or groupId" });

    console.log("📥 Received group chat file upload:", {
      from: req.userId,
      groupId,
      originalName: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      savedAs: req.file.filename,
      path: req.file.path,
    });

    const msg = await ChatMessage.create({
      from: req.userId,
      group: groupId,
      text: null,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      delivered: false,
      seen: false,
    });

    const populated = await ChatMessage.findById(msg._id).populate("from", "fullName email").lean();

    res.json({ ...populated, isMe: populated.from._id.toString() === req.userId });
  } catch (err) {
    console.error("uploadGroupChatFile error:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    group.members = group.members.filter(id => id.toString() !== req.userId);
    await group.save();
    res.json({ success: true });
  } catch (err) {
    console.error("leaveGroup error:", err);
    res.status(500).json({ error: "Failed to leave group" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (group.owner.toString() !== req.userId)
      return res.status(403).json({ error: "Only owner can delete the group" });

    await ChatMessage.deleteMany({ group: groupId });
    await Group.findByIdAndDelete(groupId);
    res.json({ message: "Group and messages deleted" });
  } catch (err) {
    console.error("deleteGroup error:", err);
    res.status(500).json({ error: "Failed to delete group" });
  }
};
