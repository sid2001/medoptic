const { admin } = require('../services/firebase.js'); 

const verifyIdToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split(' ')[1];

  if (!idToken) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports.verifyIdToken = verifyIdToken;