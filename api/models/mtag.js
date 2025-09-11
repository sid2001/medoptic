const mongoose = require('mongoose');
const User = require('./user');

const Schema = mongoose.Schema;

const mtagSchema = new Schema({
  _id: { type: String, required: true }, // rfidKeyHash as PK
  userId: { type: String, ref: 'User', required: true },
  doctorName: { type: String },
  emailDuration: { type: Date, default: Date.now() + 30 * 24 * 60 * 60 * 1000 }, // default period is 30 days
  medicineName: { type: String },
  beforeMeal: { type: Boolean },
  medicineFrequency: { type: String },
  medicineDose: {type: String},
  expiryDate: { type: Date },
  medicineDuration: { type: Number },
  notes: { type: String },
  name: { type: String },
  email: { type: String },
  dayMask: { type: String }, // 7-bit string Mon..Sun
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: undefined }
});

mtagSchema.methods.toJSON = function() {
  const mtag = this;
  const mtagObject = mtag.toObject();
  delete mtagObject.mtagId;
  return mtagObject;
}

const Mtag = mongoose.model('Mtag', mtagSchema);
module.exports = Mtag;
