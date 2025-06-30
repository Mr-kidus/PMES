// controllers/goalController.js
import Goal from "../models/goalModel.js";

export const createGoal = async (req, res) => {
  try {
    const { goal_desc } = req.body;

    if (!goal_desc || goal_desc.trim() === "") {
      return res.status(400).json({ error: "Goal description is required" });
    }

    const goal = new Goal({ goal_desc });
    await goal.save();

    res.status(201).json({ message: "Goal created successfully", data: goal });
  } catch (err) {
    res.status(500).json({
      error: "Failed to create goal",
      details: err.message,
    });
  }
};

export const getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.find().sort({ createdAt: -1 }); // Sorted by newest first
    res.status(200).json({ success: true, data: goals });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch goals",
      details: err.message,
    });
  }
};

