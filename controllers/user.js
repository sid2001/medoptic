const {db} = require('../services/firebase');
const postMtag = async (req, res, next) => {
  try{
    const data = {
      userId: req.user.uid,
      medicineName, 
      dose, 
      frequency, 
      quantity, 
      bm, 
      prescribedBy,  
      expiryDate, 
      medicDetail,
      additionalNote,
    }
    const docRef = await db.collection('mtags').doc(mtagId).set(data);
    console.info('added to db: ', docRef);
    }catch(err){
      console.error(err);
      res.status(500).send({
        type:'failed',
        message: 'Something went wrong'
      });
    }
}

const updateMtag = async (req,res,next)=>{
  const mtag = req.params['mtagId'];
  try{
  const dbDoc = await db.collection('mtags').doc(mtag).get();
  
  if(dbDoc.data().userId!==req.user.uid){
    res.status(401).json({type:'failed',message:'Unauthorized'});
    return;
  }
  if(!dbDoc.exists){
    res.status(404).json({type:'failed',message:'document does not exist'});
    return;
  }
  const data = {
    userId: user.uid,
    medicineName, 
    dose, 
    frequency, 
    quantity, 
    bm, 
    prescribedBy,  
    expiryDate, 
    medicDetail,
    additionalNote,
  } = req.body;

  await dbDoc.update(data);
  res.status(200).send({
    type:'success',
    message: 'updated successfully'});

  }catch(err){
    console.error(err);
    res.status(404).send({
      type:'error',
      message: 'Something went wrong'
    });
  }
}

const getMtag = async (req, res,next) => {
  const mtag = req.params['mtagId'];
  try{
  const dbDoc = await db.collection('mtags').doc(mtag).get();
  if(!dbDoc.exists){
    res.status(404).json({type:'failed',message:'document does not exist'});
    return;
  }

  res.status(200).json({type:'success',data:dbDoc.data()});
  }catch(err){
    console.error(err);
    res.status(404).send({
      type:'error',
      message: 'Something went wrong'
    });
  }
}

module.exports.postMtag = postMtag;
module.exports.updateMtag = updateMtag;
module.exports.getMtag = getMtag;