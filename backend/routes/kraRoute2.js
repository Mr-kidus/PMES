import express from "express";
import { createKRA, getAllKRAs, editKRA, deleteKRA } from "../controllers/kraController2.js";
//import authUser from "../middlewares/authUser.js";

const kra2Router = express.Router();

kra2Router.post("/create-kra2", createKRA);
kra2Router.get("/get-kra2", getAllKRAs);
kra2Router.put("/edit-kra2/:id", editKRA);
kra2Router.delete("/delete-kra2/:id", deleteKRA);

export default kra2Router;
