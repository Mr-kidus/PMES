import mongoose from "mongoose";

const kpiSchema = new mongoose.Schema({
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Goal2",
    required: true,
  },
  kraId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "KRA2",
    required: true,
  },
  kpi_name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const KPI2 = mongoose.model("KPI2", kpiSchema);
export default KPI2;
