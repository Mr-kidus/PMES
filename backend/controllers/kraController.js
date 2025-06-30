import KRA from "../models/kraModel.js";
import Goal from "../models/goalModel.js";

export const createKRA = async (req, res) => {
  try {
    const { kra_name } = req.body;

    if (!kra_name) {
      return res.status(400).json({ error: "kra_name is required" });
    }

    const goal = await Goal.findOne();

    if (!goal) {
      return res.status(404).json({ error: "No goal found in the database" });
    }

    const kra = new KRA({ kra_name, goalId: goal._id });
    await kra.save();

    res.status(201).json({ message: "KRA created successfully", data: kra });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create KRA", details: err.message });
  }
};
export const getAllKRAs = async (req, res) => {
  try {
    const kras = await KRA.find().populate("goalId");

    res.status(200).json(kras);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch KRAs", details: err.message });
  }
};
