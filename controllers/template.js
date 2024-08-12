const Template = require('../models/template');
const ObjectId = require('mongoose').Types.ObjectId;

const createTemplate = async (req,res)=>{
  const {doctorName,medicineName,templateName, medicineDose,medicineFrequency,medicineQuantity,expiryDate,notes} = req.body;
  const userId = req.user.uid;
  const _id = new ObjectId();
  try{
    const payload = {
      _id,
      doctorName,
      medicineName,
      templateName,
      medicineDose,
      medicineFrequency,
      medicineQuantity,
      expiryDate,
      notes,
      userId
    }
    console.log(payload);
    const template = new Template(payload);
    await template.save();
    return res.status(201).json({type:'success',message:'Template created successfully',data:{
      template : {
        ...payload,
        _id:payload._id.toString()
      }
    }});
  }catch(err){
    console.error(err);
    return res.status(500).json({type:'failed',message:'Something went wrong'});
  }
}

const deleteTemplate = async (req,res)=>{
  const {templateId} = req.params;
  try{
    await Template.deleteOne({_id:templateId});
    return res.status(200).json({type:'success',message:'Template deleted successfully'});
  }catch(err){
    return res.status(500).json({type:'failed',message:'Something went wrong'});
  }
}

const updateTemplate = async (req,res)=>{
  const {templateId} = req.params;
  var payload = {};
  const data = ({doctorName,templateName,medicineName,medicineDose,medicineFrequency,medicineQuantity,expiryDate,notes} = req.body);
  for(const key in payload){
    if(data[key]){
      payload[key] = data[key];
    }
  }
  try{
    result = await Template.findOneAndUpdate({_id:templateId},{...payload},{new:true});
    delete result.__v;
    console.log(result);
    res.status(200).json({type:'success',message:'Template updated successfully',data:{
      template : result
    }});
  }catch(err){
    console.error(err);
    res.status(500).json({type:'failed',message:'Something went wrong'});
  }
}

module.exports.createTemplate = createTemplate;
module.exports.deleteTemplate = deleteTemplate;
module.exports.updateTemplate = updateTemplate;