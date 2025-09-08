const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const scanSchema = new Schema({
  rfidKeyHash: { type: String, index: true, required: true },
  frequencyMask: { type: String }, // e.g., '1000' => morning
  dayMask: { type: String }, // e.g., '1111100' => Mon-Fri
  scannedAt: { type: Date, default: Date.now },
  isDuplicate: { type: Boolean, default: false },
  isWrongDay: { type: Boolean, default: false },
  slot: { type: String } // 'morning' | 'noon' | 'evening' | 'night'
}, { timestamps: true });

scanSchema.index({ rfidKeyHash: 1, scannedAt: -1 });

Scan = mongoose.model('Scan', scanSchema);
module.exports = Scan;


