const Template = require('../models/template');
const ObjectId = require('mongoose').Types.ObjectId;

const createTemplate = async (req,res)=>{
  const {doctorName,medicineName,medicineDose,medicineFrequency,medicineQuantity,expiryDate,notes} = req.body;
  const userId = req.user.uid;
  const _id = new ObjectId();
  try{
    const payload = {
      _id,
      doctorName,
      medicineName,
      medicineDose,
      medicineFrequency,
      medicineQuantity,
      expiryDate,
      notes,
      userId
    }
    const template = new Template(payload);
    await template.save();
    res.status(201).json({type:'success',message:'Template created successfully',data:{
      template : {
        ...payload,
        _id:payload._id.toString()
      }
    }});
  }catch(err){
    res.status(500).json({type:'failed',message:'Something went wrong'});
  }
}

const deleteTemplate = async (req,res)=>{
  const {templateId} = req.params;
  try{
    await Template.deleteOne({_id:templateId});
    res.status(200).json({type:'success',message:'Template deleted successfully'});
  }catch(err){
    res.status(500).json({type:'failed',message:'Something went wrong'});
  }
}

const updateTemplate = async (req,res)=>{
  const {templateId} = req.params;
  const {doctorName,medicineName,medicineDose,medicineFrequency,medicineQuantity,expiryDate,notes} = req.body;
  try{
    await Template.updateOne({_id:templateId},{doctorName,medicineName,medicineDose,medicineFrequency,medicineQuantity,expiryDate,notes});
    res.status(200).json({type:'success',message:'Template updated successfully'});
  }catch(err){
    res.status(500).json({type:'failed',message:'Something went wrong'});
  }
}

module.exports.createTemplate = createTemplate;
module.exports.deleteTemplate = deleteTemplate;
module.exports.updateTemplate = updateTemplate;