const User = require('../models/user');
const Template = require('../models/template');
const Mtag = require('../models/mtag');
const Scan = require('../models/scan');
const { generateAndPersistWeeklyReports } = require('../services/reports');

const updateUserInfo = async (req, res) => {
  try{
    const uid = req.user.uid;
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
  try{
    const {uid, phone_number: phone} = req.user;
    const {name,storeName,storeAddress} = req.body;
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
  try{
    const uid = req.user.uid;
    console.log('user request id:', uid);
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
    console.debug(err);
    res.status(500).send({type:'failed',message:'Something went wrong'});
  }
}

const deleteUser = async (req,res)=>{
  try{
    const uid = req.user.uid;
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


/**
 * Records an RFID scan event.
 * Expects body: { rfidKeyHash, frequencyMask, dayMask }
 */
const recordRfidScan = async (req, res) => {
  try{
    const { rfidKeyHash, frequencyMask, dayMask } = req.body;
    if(!rfidKeyHash){
      return res.status(400).send({ type:'failed', message:'rfidKeyHash required' });
    }
    const mtag = await Mtag.findOne({ rfidKeyHash });
    if(!mtag){
      return res.status(404).send({ type:'failed', message:'rfid not registered' });
    }
    // Determine slot from mask (index: 0=morning,1=noon,2=evening,3=night)
    const slotIndex = (frequencyMask || '').indexOf('1');
    const slotMap = ['morning','noon','evening','night'];
    const slot = slotIndex >=0 && slotIndex < 4 ? slotMap[slotIndex] : undefined;

    // Duplicate detection: has there been a scan today for same slot?
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(startOfDay); endOfDay.setDate(endOfDay.getDate()+1);
    const existingSameSlot = await Scan.findOne({ rfidKeyHash, slot, scannedAt: { $gte: startOfDay, $lt: endOfDay } });
    const isDuplicate = !!existingSameSlot;

    // Wrong-day detection: mtag.dayMask should include today
    let isWrongDay = false;
    try{
      const mask = (mtag.dayMask || '').padEnd(7,'0').slice(0,7); // expect 7 bits Mon..Sun
      // Map JS day (0 Sun..6 Sat) to mask index (Mon..Sun => 0..6)
      const jsDay = now.getDay();
      const maskIndex = jsDay === 0 ? 6 : jsDay - 1;
      isWrongDay = mask[maskIndex] !== '1';
    }catch(e){
      isWrongDay = false;
    }

    const scan = new Scan({ rfidKeyHash, frequencyMask, dayMask, isDuplicate, isWrongDay, slot });
    await scan.save();
    return res.status(200).send({ type:'success', message:'scan recorded' });
  }catch(err){
    console.error(err);
    return res.status(500).send({ type:'failed', message:'Something went wrong' });
  }
}


const generateWeeklyReports = async (req, res) => {
  try{
    const weekStartParam = req.query.weekStart ? new Date(req.query.weekStart) : null;
    const { weekStart, weekEnd, reports } = await generateAndPersistWeeklyReports(weekStartParam || undefined);
    return res.status(200).send({ type:'success', message:'weekly reports', data: { weekStart, weekEnd, reports } });
  }catch(err){
    console.error(err);
    return res.status(500).send({ type:'failed', message:'Something went wrong' });
  }
}

module.exports.recordRfidScan = recordRfidScan;
module.exports.generateWeeklyReports = generateWeeklyReports;
module.exports.updateUserInfo = updateUserInfo;
module.exports.getUserInfo = getUserInfo;
module.exports.registerUser = registerUser;
module.exports.deleteUser = deleteUser;