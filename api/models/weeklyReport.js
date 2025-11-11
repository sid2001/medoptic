const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const weeklyReportSchema = new Schema({
  email: { type: String, index: true, required: true },
  weekStart: { type: Date, required: true, index: true },
  weekEnd: { type: Date, required: true },
  scans: [
    {
      rfidKeyHash: String,
      frequencyMask: String,
      dayMask: String,
      scannedAt: Date
    }
  ],
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// weeklyReportSchema.index({ email: 1, weekStart: 1 }, { unique: true });

WeeklyReport = mongoose.model('WeeklyReport', weeklyReportSchema);
module.exports = WeeklyReport;


