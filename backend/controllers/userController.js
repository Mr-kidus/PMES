import generateToken from "../utils/generateToken.js";
import User from "../models/userModels.js";

import { hashPassword, verifyPassword } from "../utils/hashPassword.js";

import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

// Create new user
export const createUser = async (req, res) => {
  try {
    let { fullName, role, email, password, sector, subsector } = req.body;
    email = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn("[createUser] User already exists with email:", email);
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const { hash, salt } = hashPassword(password);

    const newUser = new User({
      fullName,
      role,
      email,
      password: hash,
      salt,
      sector: sector || null,
      subsector: subsector || null,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("[createUser] Error creating user:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during user creation" });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail })
      .populate("sector", "sector_name")
      .populate("subsector", "subsector_name");

    if (!user) {
      console.warn(`[loginUser] No user found for email: ${normalizedEmail}`);
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = verifyPassword(password, user.password, user.salt);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    generateToken(user._id, res);
    res.status(200).json({
      succuss: true,
      user,
    });
  } catch (error) {
    console.error("[loginUser] Error during login:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
};

// Get all users with populated sector/subsector names
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("sector", "sector_name")
      .populate("subsector", "subsector_name");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get profile of logged-in user by ID
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password")
      .populate("sector", "sector_name")
      .populate("subsector", "subsector_name");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully." });
};

// Get statistics about active users
export const getActiveUsersStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const lastMonthCount = await User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      },
    });

    res.status(200).json({
      count: totalUsers,
      change: totalUsers - lastMonthCount,
      lastMonthCount,
    });
  } catch (error) {
    console.error("❌ [getActiveUsersStats] Server error:", error);
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};

// Optional: Update user profile (uncomment and adjust if you want to enable)

export const updateProfile = async (req, res) => {
  try {
    const { userId, fullName, email, sector, subsector } = req.body;
    const imageFile = req.file;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let updatedData = {
      fullName,
      email,
      sector: user?.sector || null,
      subsector: user?.subsector || null,
    };

    if (imageFile) {
      const response = await uploadToCloudinary(imageFile.buffer);
      updatedData.image = response.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updatedData, { new: true })
      .populate("sector", "sector_name")
      .populate("subsector", "subsector_name");

    res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("❌ [updateProfile] Server error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Update user by admin
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, role, sector, subsector } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.role = role || user.role;
    user.sector = sector || user.sector;
    user.subsector = subsector || user.subsector;

    await user.save();

    res.json({ success: true, message: "User updated", user });
  } catch (error) {
    console.error("[updateUser] Error:", error.message, error.stack);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Update user password by admin
export const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const { hash, salt } = hashPassword(password);
    user.password = hash;
    user.salt = salt;
    await user.save();
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("[updateUserPassword] Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Change password for logged-in user
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = verifyPassword(oldPassword, user.password, user.salt);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Old password is incorrect" });
    }

    const { hash, salt } = hashPassword(newPassword);
    user.password = hash;
    user.salt = salt;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("[changePassword] Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
