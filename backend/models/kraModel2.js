import mongoose from "mongoose";

const kraSchema = new mongoose.Schema(
  {
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal2",
      required: true,
    },
    kra_name: { type: String, required: true },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual populate: KRA -> KPIs
kraSchema.virtual("kpis", {
  ref: "KPI2",
  localField: "_id",
  foreignField: "kraId",
  justOne: false,
});

const KRA2 = mongoose.model("KRA2", kraSchema);
export default KRA2;
