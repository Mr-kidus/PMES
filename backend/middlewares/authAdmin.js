import jwt from "jsonwebtoken";

const authAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Admin token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || decoded.email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ success: false, message: "Unauthorized: Admin access required" });
    }

    next();
  } catch (error) {
    console.error("authAdmin error:", error.message);
    res.status(401).json({ success: false, message: "Invalid or expired admin token" });
  }
};

export default authAdmin;
