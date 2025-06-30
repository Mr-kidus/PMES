import express from "express";
import {
  createKPI,
  getAllKPIs,
  getAllKPIData,
} from "../controllers/kpiController.js";
const kpiRouter = express.Router();
kpiRouter.post("/create-kpi", createKPI);
kpiRouter.get("/all", getAllKPIs);
kpiRouter.get("/get-kpi", getAllKPIData);
export default kpiRouter;
