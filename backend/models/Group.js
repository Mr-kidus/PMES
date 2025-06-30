import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: String,
  members: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  owner: { type: mongoose.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Group", groupSchema);
