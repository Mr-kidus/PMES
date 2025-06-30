import mongoose from "mongoose";

const performanceFileSchema = new mongoose.Schema({
  performanceId: { type: mongoose.Schema.Types.ObjectId, ref: "Performance", required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  kpiId: { type: mongoose.Schema.Types.ObjectId, ref: "KPI", required: true },
  measureId: { type: mongoose.Schema.Types.ObjectId, ref: "Measure", required: true },
  year: { type: Number, required: true },
  quarter: { type: String, required: true },
  description: { type: String, required: true },
  confirmed: { type: Boolean, default: false },
  value: { type: Number, required: true, default: 0 },  // <-- store submitted value here
  filename: { type: String },
  filepath: { type: String },
  mimetype: { type: String },
  size: { type: Number },
}, { timestamps: true });

const PerformanceFile = mongoose.model("PerformanceFile", performanceFileSchema);

export default PerformanceFile;
