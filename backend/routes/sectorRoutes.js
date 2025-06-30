import express from "express";
import {
  addSector,
  getAllSectors,
  updateSector,
  deleteSector,
} from "../controllers/sectorControllers.js";

const sectorRouter = express.Router();

sectorRouter.post("/add-sector", addSector);
sectorRouter.get("/get-sector", getAllSectors);
sectorRouter.put("/update-sector/:id", updateSector);
sectorRouter.delete("/delete-sector/:id", deleteSector);

export default sectorRouter;
