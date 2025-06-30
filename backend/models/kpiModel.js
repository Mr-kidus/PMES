import mongoose from "mongoose";

const kpiSchema = new mongoose.Schema({
  kraId: { type: mongoose.Schema.Types.ObjectId, ref: "KRA", required: true },
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", required: true },
  kpi_name: { type: String, required: true },
});

const KPI = mongoose.model("KPI", kpiSchema);
export default KPI;
