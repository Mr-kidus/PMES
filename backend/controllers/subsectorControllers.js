import sectorModel from "../models/sectorModel.js";
import Subsector from "../models/subsectorModel.js";

// Add Subsector
export const addSubsector = async (req, res) => {
  try {
    const { subsector_name, sectorId } = req.body;

    if (!subsector_name || !sectorId) {
      return res.status(400).json({ error: "subsector_name and sectorId are required" });
    }

    const existingSector = await sectorModel.findById(sectorId);
    if (!existingSector) {
      return res.status(404).json({ error: "Sector not found with the provided sectorId." });
    }

    const newSubsector = new Subsector({ sectorId, subsector_name });
    await newSubsector.save();

    res.status(201).json({ message: "Subsector added successfully", data: newSubsector });
  } catch (err) {
    console.error("Error creating Subsector:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get All Subsectors with populated sector info
export const getAllSubsectors = async (req, res) => {
  try {
    const subsectors = await Subsector.find().populate("sectorId");
    res.json(subsectors); // Note: just sending array, no wrapping data
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Subsector by ID
export const updateSubsector = async (req, res) => {
  try {
    const { id } = req.params;
    const { subsector_name, sectorId } = req.body;

    if (!subsector_name || !sectorId) {
      return res.status(400).json({ error: "subsector_name and sectorId are required" });
    }

    const subsector = await Subsector.findById(id);
    if (!subsector) {
      return res.status(404).json({ error: "Subsector not found" });
    }

    const sectorExists = await sectorModel.findById(sectorId);
    if (!sectorExists) {
      return res.status(404).json({ error: "Sector not found" });
    }

    subsector.subsector_name = subsector_name;
    subsector.sectorId = sectorId;

    await subsector.save();

    res.json({ message: "Subsector updated successfully", data: subsector });
  } catch (err) {
    console.error("Update subsector error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete Subsector by ID
export const deleteSubsector = async (req, res) => {
  try {
    const { id } = req.params;
    const subsector = await Subsector.findById(id);
    if (!subsector) {
      return res.status(404).json({ error: "Subsector not found" });
    }

    await subsector.remove();
    res.json({ message: "Subsector deleted successfully" });
  } catch (err) {
    console.error("Delete subsector error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all subsectors by sectorId
export const getSubsectorsBySector = async (req, res) => {
  try {
    const { sectorId } = req.params;

    const subsectors = await Subsector.find({ sectorId }).populate("sectorId");

    if (!subsectors || subsectors.length === 0) {
      return res.status(404).json({ message: "No subsectors found for the given sector ID" });
    }

    res.json(subsectors);
  } catch (err) {
    console.error("Error fetching subsectors by sectorId:", err);
    res.status(500).json({ error: err.message });
  }
};
