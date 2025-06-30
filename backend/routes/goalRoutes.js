import express from "express";
import { createGoal, getAllGoals } from "../controllers/goalController.js";

//import authUser from "../middlewares/authUser.js";

const goalRouter = express.Router();

// Protect both routes if necessary
goalRouter.post("/create-goal", createGoal);
goalRouter.get("/get-goal", getAllGoals);

export default goalRouter;
