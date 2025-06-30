import mongoose from 'mongoose';

const measureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  kpiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KPI2',
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('Measure', measureSchema);
