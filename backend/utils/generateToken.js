import jwt from "jsonwebtoken";

const generateToken = (userId, res) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // set true on prod
    sameSite: "strict", // adjust to 'none' if backend/frontend are cross-domain, with HTTPS!
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export default generateToken;
