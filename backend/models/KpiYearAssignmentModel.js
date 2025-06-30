import mongoose from "mongoose";

const kpiYearAssignmentSchema = new mongoose.Schema({
  sectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sector",
    required: true,
  },
  subsectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subsector",
    default: null,
  },
  // Uncomment if you want to use deskId
  // deskId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Desk",
  //   default: null,
  // },
  kpiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "KPI2",
    required: true,
  },
  kraId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "KRA2",
    required: true,
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Goal2",
    required: true,
  },
  startYear: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 10,
  },
  endYear: {
    type: Number,
    required: true,
    min: 1900,
    max: 2200,
  },
}, { timestamps: true });

const KpiYearAssignment = mongoose.model("KpiYearAssignment", kpiYearAssignmentSchema);
export default KpiYearAssignment;
