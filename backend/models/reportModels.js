import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    narration: { type: String, required: true }, // New field
    performance: { type: String, required: true }, // New field
    percentage: { type: Number, required: true }, // New field
    quarter: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
export default Report;