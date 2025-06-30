import mongoose from "mongoose";
import Measure from "../models/measureModel.js";

// ✅ Create a new Measure
export const createMeasure = async (req, res) => {
  try {
    const { name, kpiId } = req.body;

    if (!name || !kpiId) {
      return res.status(400).json({ message: "Name and KPI ID are required" });
    }

    // ✅ Ensure kpiId is cast to ObjectId (important for .populate to work)
    const measure = new Measure({
      name,
      kpiId: new mongoose.Types.ObjectId(kpiId),
    });

    const saved = await measure.save();

    return res.status(201).json({ message: "Measure created", data: saved });
  } catch (err) {
    console.error("❌ createMeasure error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all Measures by KPI ID
export const getMeasuresByKpi = async (req, res) => {
  try {
    const { kpiId } = req.params;

    if (!kpiId) {
      return res.status(400).json({ message: "KPI ID is required" });
    }

    const measures = await Measure.find({
      kpiId: new mongoose.Types.ObjectId(kpiId),
    });

    return res.status(200).json(measures);
  } catch (err) {
    console.error("❌ getMeasuresByKpi error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
