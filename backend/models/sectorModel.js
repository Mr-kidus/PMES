import mongoose from "mongoose";
const sectorSchema = new mongoose.Schema(
  {
    sector_name: { type: String, required: true },
  },
  { timestamps: true }
);

const sectorModel = mongoose.model("Sector", sectorSchema);

export default sectorModel;
