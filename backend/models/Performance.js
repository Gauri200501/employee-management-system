const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    reviewPeriod: { type: String, required: true }, // e.g. "Q1 2026" or "Annual 2026"
    reviewDate: { type: Date, default: Date.now },
    ratings: {
      technicalSkills: { type: Number, min: 1, max: 5, default: 3 },
      communication: { type: Number, min: 1, max: 5, default: 3 },
      teamwork: { type: Number, min: 1, max: 5, default: 3 },
      leadership: { type: Number, min: 1, max: 5, default: 3 },
      productivity: { type: Number, min: 1, max: 5, default: 3 },
    },
    overallRating: { type: Number, min: 1, max: 5, required: true },
    strengths: { type: String },
    areasForImprovement: { type: String },
    goals: { type: String },
    managerComments: { type: String },
    employeeComments: { type: String },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Acknowledged'],
      default: 'Submitted',
    },
  },
  { timestamps: true }
);

const Performance = mongoose.models.Performance || mongoose.model('Performance', performanceSchema);

module.exports = Performance;
