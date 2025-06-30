import Sector from "../models/sectorModel.js";

// Add Sector
export const addSector = async (req, res) => {
  try {
    const { sector_name } = req.body;
    if (!sector_name) {
      return res.status(400).json({ error: "Sector name is required" });
    }
    const existingSector = await Sector.findOne({ sector_name });
    if (existingSector) {
      return res.status(409).json({ error: "Sector already exists" });
    }
    const newSector = new Sector({ sector_name });
    await newSector.save();
    res.status(201).json({ message: "Sector added successfully", data: newSector });
  } catch (err) {
    console.error("Add sector error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get All Sectors
export const getAllSectors = async (req, res) => {
  try {
    const sectors = await Sector.find();
    res.json({ data: sectors });
  } catch (err) {
    console.error("Get sectors error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update Sector by ID
export const updateSector = async (req, res) => {
  try {
    const { id } = req.params;
    const { sector_name } = req.body;

    if (!sector_name) {
      return res.status(400).json({ error: "Sector name is required" });
    }

    const sector = await Sector.findById(id);
    if (!sector) {
      return res.status(404).json({ error: "Sector not found" });
    }

    // Optional: Check duplicate name if you want
    const duplicate = await Sector.findOne({ sector_name, _id: { $ne: id } });
    if (duplicate) {
      return res.status(409).json({ error: "Another sector with same name exists" });
    }

    sector.sector_name = sector_name;
    await sector.save();

    res.json({ message: "Sector updated successfully", data: sector });
  } catch (err) {
    console.error("Update sector error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete Sector by ID
export const deleteSector = async (req, res) => {
  try {
    const { id } = req.params;
    const sector = await Sector.findById(id);
    if (!sector) {
      return res.status(404).json({ error: "Sector not found" });
    }

    await sector.remove();
    res.json({ message: "Sector deleted successfully" });
  } catch (err) {
    console.error("Delete sector error:", err);
    res.status(500).json({ error: err.message });
  }
};
