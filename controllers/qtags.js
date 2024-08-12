const Qtag = require("../models/qtag");
const mongoose = require('mongoose');

const countValidator = (req,res)=>{
  const {count} = req.body;
  if(!count) return res.status(400).json({type:'error',message:'count is required'});
  if(!parseInt(count)) return res.status(400).json({type:'error',message:'count should be an integer'});
  if(parseInt(count) < 1) return res.status(400).json({type:'error',message:'count should be greater than 0'});
  if(parseInt(count) > 1000) return res.status(400).json({type:'error',message:'count should be less than 1000'});

  return true;
}
const createQtags = async (req,res)=>{
  if(countValidator(req,res)!==true) return;
  const {count} = req.body;
  var tagsCount = 0;

  try{
    for(let i = 0; i < count; i++){
      const qtag = new Qtag({_id:new mongoose.Types.ObjectId()});
      await qtag.save();
      tagsCount++;
    }
    return res.status(201).json({type:'success',message:`${tagsCount} qtags created`});
  }catch(err){
    console.log(err);
    if(tagsCount>0){
      return res.status(204).json({type:'success',message:`${tagsCount} qtags created`});
    }else
      return res.status(500).json({type:'error',message:'something went wrong'});
  }
}

const getQtags = async (req,res)=>{
  if(countValidator(req,res)!==true) return;
  var {count,page} = req.body;
  if(!page) page = 1;
  try{
    const qtags = await Qtag.find({inUse:false}).skip(parseInt(page-1)*count).limit(count);
    return res.status(200).json({type:'success',message:'qtags fetched',data:qtags});
  }catch(err){
    console.log(err);
    return res.status(500).json({type:'error',message:'something went wrong',error:err.message});
  }
}

module.exports.createQtags = createQtags;
module.exports.getQtags = getQtags;