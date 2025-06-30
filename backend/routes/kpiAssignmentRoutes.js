import express from "express";
import {
  assignKpi,
  getAllAssignedKpis,
  getAssignedKpis,
  getAssignedKpisWithGoalDetails,
  deleteAssignedKpi,
  getKpiDetails,
  getAssignedKpisBySector,
  getDetailedKpisBySubsector,
  getAssignedKpisDirectlyBySector,
  getAllAssignedKpisWithGoalDetails,
} from "../controllers/kpiAssignmentController.js";

import KPI2 from "../models/kpiModel2.js";

const kpiAssignmentRouter = express.Router();

// POST /assign-kpi
// Assign a KPI to a sector/subsector
kpiAssignmentRouter.post("/assign-kpi", assignKpi);

// GET /assigned-kpi
// Get all assigned KPIs
kpiAssignmentRouter.get("/assigned-kpi", getAllAssignedKpis);

// GET /assigned-kpi/:id
// Get assigned KPIs by subsector ID
kpiAssignmentRouter.get("/assigned-kpi/:id", getAssignedKpis);

// GET /assigned-kpi-with-goal-details/:id
// Get assigned KPIs with goal details by subsector ID
kpiAssignmentRouter.get("/assigned-kpi-with-goal-details/:id", getAssignedKpisWithGoalDetails);

// GET /sector/:id
// Get assigned KPIs by sector ID
kpiAssignmentRouter.get("/sector/:id", getAssignedKpisBySector);

// DELETE /unassign-kpi/:id
// Unassign a KPI by assignment ID
kpiAssignmentRouter.delete("/unassign-kpi/:id", deleteAssignedKpi);

// GET /details?ids=id1,id2,...
// Get KPI details by list of IDs in query
kpiAssignmentRouter.get("/details", getKpiDetails);

kpiAssignmentRouter.get("/details/by-subsector/:subsectorId", getDetailedKpisBySubsector);

kpiAssignmentRouter.get("/direct-sector/:id", getAssignedKpisDirectlyBySector);

// GET /assign/all
// For Minister or Strategic: get all assigned KPIs
kpiAssignmentRouter.get("/all", getAllAssignedKpisWithGoalDetails);


// GET /details/:id
// Get single KPI detail by ID
kpiAssignmentRouter.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "No KPI ID provided" });
    }

    const kpi = await KPI2.findById(id).populate({
      path: "kraId",
      select: "kra_name goalId",
      populate: {
        path: "goalId",
        select: "goal_desc",
      },
    });

    if (!kpi) {
      return res.status(404).json({ message: "No KPI found for given ID" });
    }

    res.json({ data: kpi });
  } catch (error) {
    console.error("KPI detail error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default kpiAssignmentRouter;
