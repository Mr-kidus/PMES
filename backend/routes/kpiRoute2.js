// routes/kpiRoutes2.js

import express from "express";
import {
  createKPI,
  getAllKPIs,
  getAllKPIData,
  getAssignedKPIs,
  editKPI,
  deleteKPI,
} from "../controllers/kpiControllers2.js";

const kpi2Router = express.Router();

kpi2Router.post("/create-kpi2", createKPI);
kpi2Router.get("/all2", getAllKPIs);
kpi2Router.get("/get-kpi2", getAllKPIData);
kpi2Router.get("/assigned-kpi", getAssignedKPIs);
kpi2Router.put("/edit-kpi2/:id", editKPI);
kpi2Router.delete("/delete-kpi2/:id", deleteKPI);

export default kpi2Router;
