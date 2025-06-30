// models/performanceModel.js
import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema({
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fullName: { type: String, default: '' },
  role: { type: String, required: true },

  sectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sector',
    default: null,
  },
  subsectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subsector',
    default: null,
  },

  kpiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KPI2',
    required: true,
  },
  year: { type: String, required: true },
  performanceYear: { type: Number, default: 0 },
  performanceDescription: { type: String, default: '' },

  q1Performance: {
    value: { type: Number, default: 0 },
    description: { type: String, default: '' },
  },
  q2Performance: {
    value: { type: Number, default: 0 },
    description: { type: String, default: '' },
  },
  q3Performance: {
    value: { type: Number, default: 0 },
    description: { type: String, default: '' },
  },
  q4Performance: {
    value: { type: Number, default: 0 },
    description: { type: String, default: '' },
  },

  // CEO Validation
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

  // Chief CEO Validation
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

  // Strategic Validation
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

  // Minister Final Validation
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

  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal2' },
  kraId: { type: mongoose.Schema.Types.ObjectId, ref: 'KRA2' },

  createdAt: { type: Date, default: Date.now },
});

const Performance = mongoose.model('Performance', performanceSchema);
export default Performance;
