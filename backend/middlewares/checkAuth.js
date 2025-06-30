import jwt from "jsonwebtoken";
import userModels from "../models/userModels.js";

export const checkAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModels
      .findById(decoded.id)
      .select("-password -salt")
      .populate("sector", "sector_name")
      .populate("subsector", "subsector_name"); // Exclude sensitive fields

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Optional: attach user to req for downstream use
    req.user = user;

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("checkAuth error:", err.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
