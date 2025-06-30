import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Invalid email format"],
    },
    password: { type: String, required: true },
    salt: { type: String, required: true }, // NEW: for crypto-based hashing
    role: {
      type: String,
      enum: ["Chief CEO", "CEO", "Worker", "System Admin", "Minister", "Strategic Unit"],
      required: true,
    },
    sector: { type: mongoose.Schema.Types.ObjectId, ref: "Sector", default: null },
    subsector: { type: mongoose.Schema.Types.ObjectId, ref: "Subsector", default: null },
    image: {
      type: String,
  
    },
  },
  { timestamps: true }
);

// No bcrypt-based pre-save hook needed anymore
// Passwords are hashed manually in the controller using crypto

export default mongoose.model("User", userSchema);
