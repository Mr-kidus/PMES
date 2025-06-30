import Goal2 from "../models/goalModel2.js";

export const createGoal2 = async (req, res) => {
  try {
    const { goal_desc } = req.body;

    if (!goal_desc || goal_desc.trim() === "") {
      return res.status(400).json({ error: "Goal description is required" });
    }

    const goal = new Goal2({ goal_desc });
    await goal.save();

    res.status(201).json({ message: "Goal created successfully", data: goal });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create goal", details: err.message });
  }
};

export const getAllGoals2 = async (req, res) => {
  try {
    const goals = await Goal2.find();
    res.status(200).json(goals);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch goals", details: err.message });
  }
};


export const editGoal2 = async (req, res) => {
  try {
    const { id } = req.params;
    const { goal_desc } = req.body;

    if (!goal_desc || goal_desc.trim() === "") {
      return res.status(400).json({ error: "Goal description is required" });
    }

    const updatedGoal = await Goal2.findByIdAndUpdate(
      id,
      { goal_desc },
      { new: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.status(200).json({ message: "Goal updated successfully", data: updatedGoal });
  } catch (err) {
    res.status(500).json({ error: "Failed to update goal", details: err.message });
  }
};

export const deleteGoal2 = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedGoal = await Goal2.findByIdAndDelete(id);
    if (!deletedGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete goal", details: err.message });
  }
};
