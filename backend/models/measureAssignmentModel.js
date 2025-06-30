import mongoose from 'mongoose';

const measureAssignmentSchema = new mongoose.Schema({
  measureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Measure', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  target: { type: Number, required: true },
  year: { type: String, required: true },
  quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
}, { timestamps: true });

export default mongoose.model('MeasureAssignment', measureAssignmentSchema);
