import express from "express";

import { generateUserReport } from "../controllers/reportController.js";
import authUser from "../middlewares/authUser.js";
const reportRouter = express.Router();

reportRouter.get("/generate-report", authUser, generateUserReport);

export default reportRouter;
