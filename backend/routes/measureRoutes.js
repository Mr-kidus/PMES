import express from "express";
import { createMeasure, getMeasuresByKpi } from "../controllers/measureController.js";

const kpiMeasureRouter = express.Router();

kpiMeasureRouter.post("/", createMeasure);
kpiMeasureRouter.get("/by-kpi/:kpiId", getMeasuresByKpi);

export default kpiMeasureRouter;
