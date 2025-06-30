import KpiAssignment from "../models/kpiAssignmentModel.js";
import sectorModel from "../models/sectorModel.js";
import subsectorModel from "../models/subsectorModel.js";
import KRA2 from "../models/kraModel2.js";
import KPI2 from "../models/kpiModel2.js";


// Common population configuration for assigned KPIs
const fullPopulateConfig = [
  { path: "sectorId", select: "sector_name" },
  { path: "subsectorId", select: "subsector_name" },
  {
    path: "kraId",
    select: "kra_name goalId",
    populate: {
      path: "goalId",
      select: "goal_desc"
    }
  },
  { path: "kpiId", select: "kpi_name" }
];

// Assign KPI to Sector or Subsector (mutually exclusive)
export const assignKpi = async (req, res) => {
  try {
    const { sector, subsector, kra, kpi } = req.body;

    if (!kra || !kpi) {
      return res.status(400).json({ error: "KRA and KPI are required" });
    }

    if (sector && subsector) {
      return res.status(400).json({ error: "Provide only one: either Sector or Subsector, not both." });
    }

    const kraDoc = await KRA2.findById(kra);
    const kpiDoc = await KPI2.findById(kpi);

    if (!kraDoc || !kpiDoc) {
      return res.status(400).json({ error: "Invalid KRA or KPI ID" });
    }

    let sectorId = null;
    let subsectorId = null;

    if (subsector) {
      const subsectorDoc = await subsectorModel.findById(subsector);
      if (!subsectorDoc) {
        return res.status(400).json({ error: "Invalid Subsector ID" });
      }
      subsectorId = subsectorDoc._id;
      sectorId = subsectorDoc.sectorId;
    } else if (sector) {
      const sectorDoc = await sectorModel.findById(sector);
      if (!sectorDoc) {
        return res.status(400).json({ error: "Invalid Sector ID" });
      }
      sectorId = sectorDoc._id;
    } else {
      return res.status(400).json({ error: "Either Sector or Subsector must be provided" });
    }

    // Check for duplicate assignment
    const duplicate = await KpiAssignment.findOne({
      sectorId,
      subsectorId,
      kraId: kra,
      kpiId: kpi,
    });

    if (duplicate) {
      return res.status(409).json({ error: "This KPI is already assigned to the given Sector/Subsector." });
    }

    const newAssignment = new KpiAssignment({
      sectorId,
      subsectorId,
      kraId: kraDoc._id,
      kpiId: kpiDoc._id,
    });

    await newAssignment.save();
    res.status(201).json({ message: "KPI assigned successfully", data: newAssignment });

  } catch (error) {
    console.error("Assignment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all KPI assignments (no filter)
export const getAllAssignedKpis = async (req, res) => {
  try {
    const assignedKpis = await KpiAssignment.find().populate(fullPopulateConfig);
    res.json(assignedKpis);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get KPI assignments by Subsector ID
export const getAssignedKpis = async (req, res) => {
  try {
    const { id } = req.params;
    const assignedKpis = await KpiAssignment.find({ subsectorId: id }).populate(fullPopulateConfig);

    if (!assignedKpis.length) {
      return res.status(404).json({ message: "No assigned KPIs found for this subsector" });
    }

    res.json(assignedKpis);
  } catch (error) {
    console.error("Subsector fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get KPI assignments for a Sector including all its subsectors
export const getAssignedKpisBySector = async (req, res) => {
  try {
    const { id } = req.params;

    // Find all subsectors of this sector
    const subsectors = await subsectorModel.find({ sectorId: id }).select("_id");
    const subsectorIds = subsectors.map(s => s._id);

    // Find assignments either directly on sector or on its subsectors
    const assignedKpis = await KpiAssignment.find({
      $or: [
        { sectorId: id, subsectorId: null },
        { subsectorId: { $in: subsectorIds } }
      ]
    }).populate(fullPopulateConfig);

    if (!assignedKpis.length) {
      return res.status(404).json({ message: "No assigned KPIs found for this sector" });
    }

    res.json(assignedKpis);
  } catch (error) {
    console.error("Sector KPI fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete KPI assignment by assignment ID
export const deleteAssignedKpi = async (req, res) => {
  try {
    const deleted = await KpiAssignment.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Assigned KPI not found" });
    }
    res.json({ message: "Assigned KPI deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get detailed KPI info by IDs in query parameter (?ids=id1,id2,...)
export const getKpiDetails = async (req, res) => {
  try {
    const ids = req.query.ids?.split(",") || [];

    if (!ids.length) {
      return res.status(400).json({ message: "No KPI IDs provided" });
    }

    const kpis = await KPI2.find({ _id: { $in: ids } }).populate({
      path: "kraId",
      select: "kra_name goalId",
      populate: {
        path: "goalId",
        select: "goal_desc"
      }
    });

    if (!kpis.length) {
      return res.status(404).json({ message: "No KPIs found for given IDs" });
    }

    res.json({ data: kpis });
  } catch (error) {
    console.error("KPI detail error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Group assigned KPIs by Goal and KRA for a subsector
export const getAssignedKpisWithGoalDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const assignments = await KpiAssignment.find({ subsectorId: id }).populate([
      {
        path: "kraId",
        select: "kra_name goalId",
        populate: {
          path: "goalId",
          select: "goal_desc"
        }
      },
      {
        path: "kpiId",
        select: "kpi_name"
      }
    ]);

    if (!assignments.length) {
      return res.status(404).json({ message: "No assigned KPIs found" });
    }

    const grouped = {};

    assignments.forEach(({ kraId, kpiId }) => {
      if (!kraId || !kpiId) return;
      const goal = kraId.goalId;
      if (!goal) return;

      const goalId = goal._id.toString();
      const kraIdStr = kraId._id.toString();

      if (!grouped[goalId]) {
        grouped[goalId] = {
          goal_desc: goal.goal_desc,
          kras: {}
        };
      }

      if (!grouped[goalId].kras[kraIdStr]) {
        grouped[goalId].kras[kraIdStr] = {
          kra_name: kraId.kra_name,
          kpis: []
        };
      }

      grouped[goalId].kras[kraIdStr].kpis.push({
        _id: kpiId._id,
        kpi_name: kpiId.kpi_name
      });
    });

    res.json(grouped);
  } catch (error) {
    console.error("Error grouping KPIs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get assigned KPIs with goal and KRA details for a sector (including subsectors)
// Returns a flat array of assignments populated for frontend processing
export const getAssignedKpisWithGoalDetailsForSector = async (req, res) => {
  try {
    const { id } = req.params;

    const subsectors = await subsectorModel.find({ sectorId: id }).select("_id");
    const subsectorIds = subsectors.map(s => s._id);

    const assignments = await KpiAssignment.find({
      $or: [
        { sectorId: id, subsectorId: null },
        { subsectorId: { $in: subsectorIds } }
      ]
    }).populate([
      {
        path: "sectorId",
        select: "sector_name"
      },
      {
        path: "kraId",
        select: "kra_name goalId",
        populate: {
          path: "goalId",
          select: "goal_desc"
        }
      },
      {
        path: "kpiId",
        select: "kpi_name"
      }
    ]);

    if (!assignments.length) {
      return res.status(404).json({ message: "No assigned KPIs found for this sector" });
    }

    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assigned KPIs for sector:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDetailedKpisBySubsector = async (req, res) => {
  try {
    const { subsectorId } = req.params;

    if (!subsectorId) {
      console.warn("No subsectorId provided");
      return res.status(400).json({ message: "Subsector ID is required" });
    }

    const assignments = await KpiAssignment.find({ subsectorId })
      .populate({
        path: "kpiId",
        populate: {
          path: "kraId",
          select: "kra_name goalId",
          populate: {
            path: "goalId",
            select: "goal_desc"
          }
        }
      });

    console.log("Raw assignments fetched for subsector:", assignments);

    const detailedKpis = assignments
      .map(a => a.kpiId)
      .filter(k => k !== null); // Avoid nulls in case of bad data

    console.log("Detailed KPIs after extraction:", detailedKpis);

    res.json(detailedKpis);
  } catch (error) {
    console.error("Error fetching KPI details by subsector:", error);
    res.status(500).json({ message: "Failed to fetch KPI details" });
  }
};

// Get assigned KPIs assigned directly to sector (subsectorId = null)
export const getAssignedKpisDirectlyBySector = async (req, res) => {
  try {
    const { id } = req.params; // sector ID

    // Find assignments where sectorId matches and subsectorId is null
    const assignedKpis = await KpiAssignment.find({
      sectorId: id,
      subsectorId: null,
    }).populate([
      { path: "sectorId", select: "sector_name" },
      {
        path: "kraId",
        select: "kra_name goalId",
        populate: {
          path: "goalId",
          select: "goal_desc",
        },
      },
      { path: "kpiId", select: "kpi_name" },
    ]);

    if (!assignedKpis.length) {
      return res.status(404).json({ message: "No assigned KPIs directly on this sector" });
    }

    res.json(assignedKpis);
  } catch (error) {
    console.error("Direct sector KPI fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Get all assigned KPIs with full goal, KRA, and KPI detail
export const getAllAssignedKpisWithGoalDetails = async (req, res) => {
  try {
    const assignments = await KpiAssignment.find().populate([
      { path: "sectorId", select: "sector_name" },
      { path: "subsectorId", select: "subsector_name" },
      {
        path: "kraId",
        select: "kra_name goalId",
        populate: {
          path: "goalId",
          select: "goal_desc",
        },
      },
      { path: "kpiId", select: "kpi_name" },
    ]);

    res.json(assignments);
  } catch (error) {
    console.error("Error fetching all assignments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
