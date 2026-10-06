const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema(
  {
    designationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    department: {
      type: String,
    },
    description: { type: String },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

const Designation = mongoose.models.Designation || mongoose.model('Designation', designationSchema);

module.exports = Designation;
