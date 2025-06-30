import mongoose from "mongoose";

const kpiAssignmentSchema = new mongoose.Schema({
  sectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sector",
    required: true,
  },
  subsectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subsector",
    required: false,  // Optional field now
    default: null,    // Defaults to null if not provided
  },
  kraId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "KRA2",
    required: true,
  },
  kpiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "KPI2",
    required: true,
  },
}, { timestamps: true });

const KpiAssignment = mongoose.model("KpiAssignment", kpiAssignmentSchema);

export default KpiAssignment;
