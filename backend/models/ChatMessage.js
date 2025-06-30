import mongoose from "mongoose";
const chatMessageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // For group messages, this can be null
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null }, // For group messages
  text: String,
  fileUrl: { type: String, default: null },   // <-- Add this
  fileName: { type: String, default: null },  // <-- And this
  delivered: { type: Boolean, default: false },
  seen: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model("ChatMessage", chatMessageSchema);