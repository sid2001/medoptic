const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const temporaryReportSchema = new Schema({
  email: { type: String, index: true, required: true },
  weekStart: { type: Date, required: true, index: true },
  weekEnd: { type: Date, required: true },
  data: { type: Buffer, required: true },
  expiresAt: { type: Date, required: true, index: true }
}, { timestamps: true });


// temporaryReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

TemporaryReport = mongoose.model('TemporaryReport', temporaryReportSchema);
module.exports = TemporaryReport;


