import express from "express";
import {
  addSubsector,
  getAllSubsectors,
  updateSubsector,
  deleteSubsector,
  getSubsectorsBySector
} from "../controllers/subsectorControllers.js";

const subsectorRouter = express.Router();

subsectorRouter.post("/add-subsector", addSubsector);
subsectorRouter.get("/get-subsector", getAllSubsectors);
subsectorRouter.put("/update-subsector/:id", updateSubsector);
subsectorRouter.delete("/delete-subsector/:id", deleteSubsector);
subsectorRouter.get("/by-sector/:sectorId", getSubsectorsBySector);


export default subsectorRouter;
