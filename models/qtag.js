const mongoose = require('mongoose');

const qtagSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  inUse: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

Qtag = mongoose.model('Qtag', qtagSchema);

module.exports = Qtag;