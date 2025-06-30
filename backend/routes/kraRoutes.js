import express from "express";
import { createKRA, getAllKRAs } from "../controllers/kraController.js";
//import authUser from "../middlewares/authUser.js";

const kraRouter = express.Router();

kraRouter.post("/create-kra", createKRA);
kraRouter.get("/get-kra", getAllKRAs);

export default kraRouter;
