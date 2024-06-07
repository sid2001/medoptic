const {admin} = require('../services/firebase.js');
const updateUserInfo = async (req, res) => {
  const uid = req.user.uid;
  const {name,email} = req.body;
  try{
  await admin.auth().setCustomUserClaims(uid, { admin:true,
    name,
    email,
    emailVerified: false,
  });
  
  res.status(200).send({type:'success',message:'updated successfully'});
  }catch(err){
    console.error(err);
    res.status(500).send({type:'failed',message:'Something went wrong'});
  }
} 

const getUserInfo = async (req, res) => {
}

module.exports.updateUserInfo = updateUserInfo;
module.exports.getUserInfo = getUserInfo