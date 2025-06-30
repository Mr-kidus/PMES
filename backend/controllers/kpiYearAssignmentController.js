import KpiYearAssignment from "../models/KpiYearAssignmentModel.js";
import KPI2 from "../models/kpiModel2.js";

// GET all KPI year assignments, optionally filtered by sectorId
export const getAllKpiYearAssignments = async (req, res) => {
  try {
    const { sectorId } = req.query;
    console.log("GET /api/year called with sectorId:", sectorId);

    const filter = {};
    if (sectorId) filter.sectorId = sectorId;

    console.time("find assignments");
    const assignments = await KpiYearAssignment.find(filter)
      .populate("sectorId", "sector_name")
      .populate("subsectorId", "subsector_name sectorId")
      .populate({
        path: "kpiId",
        select: "kpi_id kpi_name kraId goalId",
        populate: [
          { path: "kraId", select: "kra_id kra_name" },
          { path: "goalId", select: "goal_id goal_desc" },
        ],
      });
    console.timeEnd("find assignments");

    const formatted = assignments.map((a) => {
      const kpi = a.kpiId || {};
      const kra = kpi.kraId || {};
      const goal = kpi.goalId || {};
      return {
        _id: a._id,
        sectorId: a.sectorId,
        subsectorId: a.subsectorId,
        kpi: {
          kpi_id: kpi.kpi_id,
          kpi_name: kpi.kpi_name,
          _id: kpi._id,
        },
        kra: {
          kra_id: kra.kra_id,
          kra_name: kra.kra_name,
        },
        goal: {
          goal_id: goal.goal_id,
          goal_desc: goal.goal_desc,
        },
        startYear: a.startYear,
        endYear: a.endYear,
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error getting KPI year assignments:", error);
    res.status(500).json({ message: "Failed to fetch KPI year assignments" });
  }
};

// PUT update startYear and endYear by KPI year assignment _id
export const updateKpiYearAssignmentYears = async (req, res) => {
  try {
    const { id } = req.params;
    const { startYear, endYear } = req.body;

    if (
      typeof startYear !== "number" ||
      typeof endYear !== "number" ||
      startYear > endYear
    ) {
      return res.status(400).json({
        message: "Invalid startYear and endYear. Ensure startYear <= endYear.",
      });
    }

    console.time("findByIdAndUpdate");
    const updatedAssignment = await KpiYearAssignment.findByIdAndUpdate(
      id,
      { startYear, endYear },
      { new: true }
    )
      .populate("sectorId", "sector_name")
      .populate("subsectorId", "subsector_name sectorId")
      .populate({
        path: "kpiId",
        select: "kpi_id kpi_name kraId goalId",
        populate: [
          { path: "kraId", select: "kra_id kra_name" },
          { path: "goalId", select: "goal_id goal_desc" },
        ],
      });
    console.timeEnd("findByIdAndUpdate");

    if (!updatedAssignment) {
      return res.status(404).json({ message: "KPI year assignment not found" });
    }

    const kpi = updatedAssignment.kpiId || {};
    const kra = kpi.kraId || {};
    const goal = kpi.goalId || {};

    res.status(200).json({
      _id: updatedAssignment._id,
      sectorId: updatedAssignment.sectorId,
      subsectorId: updatedAssignment.subsectorId,
      kpi: {
        kpi_id: kpi.kpi_id,
        kpi_name: kpi.kpi_name,
        _id: kpi._id,
      },
      kra: {
        kra_id: kra.kra_id,
        kra_name: kra.kra_name,
      },
      goal: {
        goal_id: goal.goal_id,
        goal_desc: goal.goal_desc,
      },
      startYear: updatedAssignment.startYear,
      endYear: updatedAssignment.endYear,
    });
  } catch (error) {
    console.error("Error updating KPI year assignment:", error);
    res.status(500).json({ message: "Failed to update KPI year assignment" });
  }
};

// POST create or update KPI year assignment
export const assignOrUpdateKpiYearAssignment = async (req, res) => {
  try {
    let {
      assignmentId,
      sectorId,
      subsectorId = null,
      kpiId,
      kraId,
      goalId,
      startYear,
      endYear,
    } = req.body;

    // Fetch missing kraId and goalId from KPI if needed
    if ((!kraId || !goalId) && kpiId) {
      const kpiDoc = await KPI2.findById(kpiId).select("kraId goalId");
      if (!kpiDoc) {
        return res.status(400).json({ message: "Invalid kpiId, KPI not found" });
      }
      kraId = kraId || kpiDoc.kraId;
      goalId = goalId || kpiDoc.goalId;
    }

    // Validation
    if (!sectorId || !kpiId || !kraId || !goalId || startYear == null || endYear == null) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (
      typeof startYear !== "number" ||
      typeof endYear !== "number" ||
      startYear > endYear
    ) {
      return res.status(400).json({
        message: "Invalid startYear and endYear. Ensure startYear <= endYear.",
      });
    }

    let assignment;

    // If assignmentId provided, update it
    if (assignmentId) {
      assignment = await KpiYearAssignment.findByIdAndUpdate(
        assignmentId,
        { startYear, endYear },
        { new: true }
      );
    }

    // If no assignment found by ID, try by sector+KPI combo or create new
    if (!assignment) {
      const existing = await KpiYearAssignment.findOne({
        sectorId,
        subsectorId,
        kpiId,
        kraId,
        goalId,
      });

      if (existing) {
        existing.startYear = startYear;
        existing.endYear = endYear;
        assignment = await existing.save();
      } else {
        assignment = await KpiYearAssignment.create({
          sectorId,
          subsectorId,
          kpiId,
          kraId,
          goalId,
          startYear,
          endYear,
        });
      }
    }

    // Populate assignment
    const populatedAssignment = await KpiYearAssignment.findById(assignment._id)
      .populate("sectorId", "sector_name")
      .populate("subsectorId", "subsector_name sectorId")
      .populate({
        path: "kpiId",
        select: "kpi_id kpi_name kraId goalId",
        populate: [
          { path: "kraId", select: "kra_id kra_name" },
          { path: "goalId", select: "goal_id goal_desc" },
        ],
      });

    if (!populatedAssignment) {
      return res.status(404).json({ message: "Assignment not found after saving" });
    }

    const kpi = populatedAssignment.kpiId || {};
    const kra = kpi.kraId || {};
    const goal = kpi.goalId || {};

    res.status(200).json({
      message: "KPI year assignment successful",
      data: {
        _id: populatedAssignment._id,
        sectorId: populatedAssignment.sectorId,
        subsectorId: populatedAssignment.subsectorId,
        kpi: {
          kpi_id: kpi.kpi_id,
          kpi_name: kpi.kpi_name,
          _id: kpi._id,
        },
        kra: {
          kra_id: kra.kra_id,
          kra_name: kra.kra_name,
        },
        goal: {
          goal_id: goal.goal_id,
          goal_desc: goal.goal_desc,
        },
        startYear: populatedAssignment.startYear,
        endYear: populatedAssignment.endYear,
      },
    });
  } catch (error) {
    console.error("Error assigning KPI year:", error);
    res.status(500).json({ message: "Server error during KPI year assignment" });
  }
};
