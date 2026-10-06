const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      unique: true,
      index: true,
    },
    year: { type: Number, default: () => new Date().getFullYear() },
    casualLeave: {
      total: { type: Number, default: 12 },
      used: { type: Number, default: 0 },
    },
    sickLeave: {
      total: { type: Number, default: 10 },
      used: { type: Number, default: 0 },
    },
    earnedLeave: {
      total: { type: Number, default: 15 },
      used: { type: Number, default: 0 },
    },
    maternityLeave: {
      total: { type: Number, default: 180 },
      used: { type: Number, default: 0 },
    },
    paternityLeave: {
      total: { type: Number, default: 15 },
      used: { type: Number, default: 0 },
    },
    unpaidLeave: {
      used: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const LeaveBalance = mongoose.models.LeaveBalance || mongoose.model('LeaveBalance', leaveBalanceSchema);

module.exports = LeaveBalance;
