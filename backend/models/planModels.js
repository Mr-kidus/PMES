// models/planModels.js
import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  fullName: { type: String, default: '' },
  role: { type: String, required: true },

  sectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sector', default: null },
  subsectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subsector', default: null },

  kpiId: { type: mongoose.Schema.Types.ObjectId, ref: 'KPI2', required: true },
  kpi_name: { type: String, required: true },
  kraId: { type: mongoose.Schema.Types.ObjectId, ref: 'KRA2', required: true },
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal2', required: true },

  year: { type: String, required: true },
  target: { type: Number, required: true },
  q1: { type: Number, default: 0 },
  q2: { type: Number, default: 0 },
  q3: { type: Number, default: 0 },
  q4: { type: Number, default: 0 },

  // CEO validation
  ceoValidationYear: { type: String, default: 'Pending' },
  ceoValidationQ1: { type: String, default: 'Pending' },
  ceoValidationQ2: { type: String, default: 'Pending' },
  ceoValidationQ3: { type: String, default: 'Pending' },
  ceoValidationQ4: { type: String, default: 'Pending' },
  ceoValidationDescriptionYear: { type: String, default: '' },
  ceoValidationDescriptionQ1: { type: String, default: '' },
  ceoValidationDescriptionQ2: { type: String, default: '' },
  ceoValidationDescriptionQ3: { type: String, default: '' },
  ceoValidationDescriptionQ4: { type: String, default: '' },

  // Chief CEO validation
  chiefCeoValidationYear: { type: String, default: 'Pending' },
  chiefCeoValidationQ1: { type: String, default: 'Pending' },
  chiefCeoValidationQ2: { type: String, default: 'Pending' },
  chiefCeoValidationQ3: { type: String, default: 'Pending' },
  chiefCeoValidationQ4: { type: String, default: 'Pending' },
  chiefCeoValidationDescriptionYear: { type: String, default: '' },
  chiefCeoValidationDescriptionQ1: { type: String, default: '' },
  chiefCeoValidationDescriptionQ2: { type: String, default: '' },
  chiefCeoValidationDescriptionQ3: { type: String, default: '' },
  chiefCeoValidationDescriptionQ4: { type: String, default: '' },

  // Strategic validation
  strategicValidationYear: { type: String, default: 'Pending' },
  strategicValidationQ1: { type: String, default: 'Pending' },
  strategicValidationQ2: { type: String, default: 'Pending' },
  strategicValidationQ3: { type: String, default: 'Pending' },
  strategicValidationQ4: { type: String, default: 'Pending' },
  strategicValidationDescriptionYear: { type: String, default: '' },
  strategicValidationDescriptionQ1: { type: String, default: '' },
  strategicValidationDescriptionQ2: { type: String, default: '' },
  strategicValidationDescriptionQ3: { type: String, default: '' },
  strategicValidationDescriptionQ4: { type: String, default: '' },

  // Minister (Final) validation
  validationStatusYear: { type: String, default: 'Pending' },
  validationStatusQ1: { type: String, default: 'Pending' },
  validationStatusQ2: { type: String, default: 'Pending' },
  validationStatusQ3: { type: String, default: 'Pending' },
  validationStatusQ4: { type: String, default: 'Pending' },
  validationDescriptionYear: { type: String, default: '' },
  validationDescriptionQ1: { type: String, default: '' },
  validationDescriptionQ2: { type: String, default: '' },
  validationDescriptionQ3: { type: String, default: '' },
  validationDescriptionQ4: { type: String, default: '' },

  createdAt: { type: Date, default: Date.now },
});

planSchema.index({ kpiId: 1, year: 1 }, { unique: true });

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
