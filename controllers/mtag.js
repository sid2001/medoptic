const Mtag = require('../models/mtag');
const Template = require('../models/template');
const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/user');
const Qtag = require('../models/qtag');
const createMtag = async (req, res, next) => {
  console.log('create mtag request received');
  try{
    const userId = req.user.uid;
    let storeName = await User.findOne({_id:userId}).select('storeName');
    storeName = storeName.storeName;
    console.log("store Name: ",storeName);
    console.log("store Name: ",storeName.storeName);
    var {saveAsTemplate,templateName} = req.body;
    const {medicineName, doctorName,medicineDose, medicineFrequency, medicineQuantity, expiryDate, notes} = req.body;
    const mtagId = req.params['mtagId'];
    const qtag = await Qtag.findOne({_id: new ObjectId(mtagId)});
    if(!qtag){
      return res.status(400).send({type:'failed',message:'qtag does not exist'});
    }
    if(qtag.inUse){
      return res.status(400).send({type:'failed',message:'qtag already in use'});
    }
    qtag.inUse = true;
    await qtag.save();
    var data = {
      userId,
      _id:mtagId,
      storeName,
      doctorName,
      medicineName, 
      medicineDose, 
      medicineFrequency, 
      medicineQuantity,
      expiryDate,
      notes
    }
    const newMtag = new Mtag(data);
    await newMtag.save();
  }catch(err){
    res.status(500).send({type:'failed',message:'Something went wrong'});
  }
  try{
    if(saveAsTemplate!==undefined&&saveAsTemplate===true){
      var templateId = new ObjectId();
      console.log("templateId: ",templateId.toString());
      console.log("templateId object: ",templateId);
      const payload = {
        ...data,
        _id:templateId,
        templateName
      }
      const template = new Template({
        ...payload
      })
      await template.save();
      console.log('template from post Mtag: ',template);
      delete payload.userId;
      delete payload.storeName;
      res.status(200).json({type:'success',message:'mtag created successfully',data:{
        template:{
          ...payload,
          _id : templateId
        }
      }});
    }else{
      res.status(200).json({type:'success',message:'mtag created successfully'});
    }
    console.info('created mtag');
    }catch(err){
      console.error(err);
      res.status(207).send({
        type:'partial success',
        message: "couldn't create template"
      });
    }
}

// const updateMtag = async (req,res,next)=>{
//   const mtag = req.params['mtagId'];
//   try{
//   const dbDoc = await db.collection('mtags').doc(mtag).get();
  
//   if(dbDoc.data().userId!==req.user.uid){
//     res.status(401).json({type:'failed',message:'Unauthorized'});
//     return;
//   }
//   if(!dbDoc.exists){
//     res.status(404).json({type:'failed',message:'document does not exist'});
//     return;
//   }
//   const data = {
//     userId: user.uid,
//     medicineName, 
//     dose, 
//     frequency, 
//     quantity, 
//     bm, 
//     prescribedBy,  
//     expiryDate, 
//     medicDetail,
//     additionalNote,
//   } = req.body;

//   await dbDoc.update(data);
//   res.status(200).send({
//     type:'success',
//     message: 'updated successfully'});

//   }catch(err){
//     console.error(err);
//     res.status(404).send({
//       type:'error',
//       message: 'Something went wrong'
//     });
//   }
// }
const getMtag = async (req, res,next) => {
  const mtagId = req.params['mtagId'];
  try{
    const mtag = await Mtag.findOne({_id:mtagId});
    if(!mtag){
      res.status(404).json({type:'failed',message:'document does not exist'});
      return;
    }
    res.status(200).json({type:'success',message:'mtag fetched successfully',data:mtag});
  }catch(err){
    console.error(err);
    res.status(404).send({
      type:'error',
      message: 'Something went wrong'
    });
  }
}

const verifyMtagId = async (req, res) => {
  const mtagId = req.params['mtagId'];
  try{
    mtagId = new ObjectId(mtagId);
  }catch(err){
    console.error(err);
    return res.status(400).send({
      type:'error',
      message: 'Invalid mtag id'
    });
  }
  try{
    const qtag = await Qtag.findOne({_id: mtagId});
    if(!qtag){
      return res.status(404).send({type:'failed',message:'qtag id does not exist'});
    }
    if(qtag.inUse){
      return res.status(406).send({type:'failed',message:'qtag id already in use'});
    }
    return res.status(200).send({type:'success',message:'valid mtag id'});
  }catch(err){
    console.error(err);
    res.status(500).send({
      type:'error',
      message: 'Internal Server Error'
    });
  }
}

module.exports.createMtag = createMtag;
// module.exports.updateMtag = updateMtag;
module.exports.getMtag = getMtag;
module.exports.verifyMtagId = verifyMtagId;