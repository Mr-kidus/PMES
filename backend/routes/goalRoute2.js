import express from "express";
import { createGoal2, getAllGoals2, editGoal2, deleteGoal2 } from "../controllers/goalControllers2.js";

//import authUser from "../middlewares/authUser.js";

const goal2Router = express.Router();

// Protect both routes if necessary
goal2Router.post("/create-goal2", createGoal2);
goal2Router.get("/get-goal2", getAllGoals2);
goal2Router.put("/edit-goal2/:id", editGoal2);
goal2Router.delete("/delete-goal2/:id", deleteGoal2);

export default goal2Router;
