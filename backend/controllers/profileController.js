import User from "../models/userModels.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js"; // your cloud upload helper

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password")
      .populate("sector", "sector_name")
      .populate("subsector", "subsector_name");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { fullName, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!fullName || !phone || !address || !dob || !gender) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let parsedAddress;
    try {
      parsedAddress = typeof address === "string" ? JSON.parse(address) : address;
    } catch (error) {
      return res.status(400).json({ success: false, message: "Invalid address format" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let updatedData = {
      fullName,
      phone,
      address: parsedAddress,
      dob,
      gender,
    };

    if (imageFile) {
      // Upload from buffer to Cloudinary (or any cloud)
      const uploadResponse = await uploadToCloudinary(imageFile.buffer);
      updatedData.profileImage = uploadResponse.secure_url;

      // Optional: If you want to delete old local images, handle here
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true })
      .select("-password")
      .populate("sector", "sector_name")
      .populate("subsector", "subsector_name");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
