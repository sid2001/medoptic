const { admin } = require('../services/firebase.js'); 

const verifyIdToken = async (req, res, next) => {
  try{
    var idToken = req.headers.authorization?.split(' ')[1].trim();
  }catch(err){
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  console.log("idToken:", idToken,"sd")
  if (!idToken) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    console.log('verifying token...');
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log(decodedToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports.verifyIdToken = verifyIdToken;