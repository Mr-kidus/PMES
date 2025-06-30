import sectorModel from "../models/sectorModel.js";
import subsectorModel from "../models/subsectorModel.js";

export const getResultFrameworkMenu = async (req, res) => {
  try {
    const sectors = await sectorModel.find().lean();
    const subsectors = await subsectorModel.find().lean();

    // group subsectors by sectorId for quick lookup
    const subsectorsBySector = subsectors.reduce((acc, sub) => {
      const key = sub.sectorId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push({ _id: sub._id, name: sub.subsector_name });
      return acc;
    }, {});

    const menu = sectors.map((sector) => ({
      _id: sector._id,
      name: sector.sector_name,
      slug: sector.sector_name.toLowerCase().replace(/\s+/g, "-"),
      subsectors: subsectorsBySector[sector._id.toString()] || [],
    }));

    res.status(200).json(menu);
  } catch (error) {
    console.error("Error fetching Result Framework menu:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
