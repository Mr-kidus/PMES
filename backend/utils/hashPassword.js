// utils/hashPassword.js
import crypto from "crypto";

// Generate a salt and hash the password
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");

  return { salt, hash };
}

// Compare password with stored salt/hash
export function verifyPassword(inputPassword, storedHash, storedSalt) {
  const inputHash = crypto
    .pbkdf2Sync(inputPassword, storedSalt, 1000, 64, "sha512")
    .toString("hex");

  return inputHash === storedHash;
}
