const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  templateName: {
    type: String,
    required: true
  },
  userId: String,
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

templateSchema.statics.serializeTemplates = function(templates) {
  return templates.map((template) => {
    const {_id,doctorName,medicineName,medicineDose,medicineFrequency,medicineQuantity,expiryDate,notes} = template;
    delete template.userId;
    return {
      _id: _id,
      doctorName,
      medicineName,
      medicineDose,
      medicineFrequency,
      medicineQuantity,
      expiryDate,
      notes
    }
 })
}
const Template = mongoose.model('Template', templateSchema);

templateSchema.index({userId: 1});
module.exports = Template;