import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadMemory } from "../middlewares/multer.js";  // import memory upload

const profileRouter = express.Router();

profileRouter.get("/", authMiddleware, getProfile);
profileRouter.put("/", authMiddleware, uploadMemory.single("profileImage"), updateProfile);

export default profileRouter;
