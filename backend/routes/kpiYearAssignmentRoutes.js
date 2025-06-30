import express from "express";
import {
  getAllKpiYearAssignments,
  updateKpiYearAssignmentYears,
  assignOrUpdateKpiYearAssignment,
} from "../controllers/kpiYearAssignmentController.js";

const kpiYearAssignmentRouter = express.Router();

// Fetch all KPI year assignments (GET /api/year/all)
kpiYearAssignmentRouter.get("/all", getAllKpiYearAssignments);

// Also respond to GET /api/year/assigned-kpi-year (same handler)
kpiYearAssignmentRouter.get("/assigned-kpi-year", getAllKpiYearAssignments);

// Update startYear and endYear of an existing KPI year assignment by assignment ID (PUT /api/year/:id/update-years)
kpiYearAssignmentRouter.put("/:id/update-years", updateKpiYearAssignmentYears);

// Assign or update KPI year assignment (POST /api/year/assign)
kpiYearAssignmentRouter.post("/assign", assignOrUpdateKpiYearAssignment);

export default kpiYearAssignmentRouter;
