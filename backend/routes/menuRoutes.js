import express from "express";
import { getResultFrameworkMenu } from "../controllers/menuControllers.js";

const menuRouter = express.Router();

menuRouter.get("/result-framework", getResultFrameworkMenu);

export default menuRouter;
