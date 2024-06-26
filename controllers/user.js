const User = require('../models/user');
const Template = require('../models/template');

const updateUserInfo = async (req, res) => {
  const uid = req.user.uid;
  try{
    const user = await User.findOne({_id:uid});
    if(!user){
      res.status(404).send({type:'failed',message:'User not found'});
    }
    const {name, storeName, storeAddress} = req.body;
    const data = {
      name,
      storeName,
      storeAddress,
      // email:{
      //   address:email,
      //   verified:false
      // },
      updatedAt:Date.now()
    }
    for(const key in data){
      if(!data[key]){
        delete data[key];
      }
    }
    await User.updateOne({_id:uid},data);
    res.status(200).send({type:'success',message:'updated successfully'});
  }catch(err){
    console.error(err);
    res.status(500).send({type:'failed',message:'Something went wrong'});
  }
} 

const registerUser = async (req,res) => {
  const {uid, phone_number: phone} = req.user;
  const {name,storeName,storeAddress} = req.body;
  try{
    const user = await User.findOne({_id:uid});
    if(user){
      res.status(400).send({type:'failed',message:'User already exists'});
    }else{
      const newUser = new User({
        _id:uid,
        name,
        storeName,
        storeAddress,
        // email:{
        //   address:email,
        //   verified:false
        // },
        phone,
      })
      await newUser.save();

      res.status(200).send({type:'success',message:'User created successfully'});
    }
  }catch(err){
    console.debug(err);
    res.status(500).send({type:'failed',message:'Something went wrong'});
  }
}
const getUserInfo = async (req, res) => {
  const uid = req.user.uid;
  console.log('user request id:', uid);
  try{
    const user = await User.findOne({_id:uid});
    if(!user){
      res.status(404).send({type:'failed',message:'User not found'});
    }else{
      const {name,storeName,storeAddress,phone,profilePic,createdAt,updatedAt} = user;
      const payload = {
        name,
        storeName,
        storeAddress,
        phone,
        profilePic,
        createdAt,
        updatedAt
      }
      const templates = await Template.find({userId:uid});
      if(templates){
        payload.templates = Template.serializeTemplates(templates);
      }
      res.status(200).send({type:'success',message:'User found',data:payload});
    }
  }catch(err){
    console.debub(err);
    res.status(500).send({type:'failed',message:'Something went wrong'});
  }
}

const deleteUser = async (req,res)=>{
  const uid = req.user.uid;
  try{
    const user = await User.findOne({_id:uid});
    if(!user){
      res.status(404).send({type:'failed',message:'User not found'});
    }else{
      await User.deleteOne({_id:uid});
      await Template.deleteMany({userId:uid});
      res.status(200).send({type:'success',message:'User deleted successfully'});
    }
  }catch(err){
    console.debug(err);
    res.status(500).send({type:'failed',message:'Something went wrong'});
  }
}

module.exports.updateUserInfo = updateUserInfo;
module.exports.getUserInfo = getUserInfo;
module.exports.registerUser = registerUser;
module.exports.deleteUser = deleteUser;