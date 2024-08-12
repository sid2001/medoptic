const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const mtagSchema = new Schema({
  _id: String,
  userId: String,
  storeName: String,
  doctorName: String,
  medicineName: String,
  medicineDose: String,
  medicineFrequency: String,
  medicineQuantity: {
    morning: {
      beforeMeal: Boolean,
      count: Number
    },
    afternoon:{
      beforeMeal: Boolean,
      count: Number
    },
    evening: {
      beforeMeal: Boolean,
      count: Number
    }
  },
  expiryDate: Date,
  notes: String
})

mtagSchema.methods.toJSON = function() {
  const mtag = this;
  const mtagObject = mtag.toObject();
  delete mtagObject.mtagId;
  delete mtagObject._id;
  return mtagObject;
}

mtagSchema.index({ mtagId: 1 }, { unique: true });

Mtag = mongoose.model('Mtag',mtagSchema);
module.exports = Mtag;
