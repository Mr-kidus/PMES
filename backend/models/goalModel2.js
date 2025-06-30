import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    goal_desc: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual populate: Goal -> KRAs
goalSchema.virtual("kras", {
  ref: "KRA2",
  localField: "_id",
  foreignField: "goalId",
  justOne: false,
});

const Goal2 = mongoose.model("Goal2", goalSchema);
export default Goal2;
