const router = require('express').Router();
const {updateUserInfo,getUserInfo,registerUser,deleteUser} = require('../controllers/user.js');
const {verifyIdToken} = require('../middlewares/auth.js');

router.post('/updateUserInfo',verifyIdToken,updateUserInfo);

router.get('/getUserInfo',verifyIdToken,getUserInfo);

router.post('/register',verifyIdToken,registerUser);

router.post('/deleteUser',verifyIdToken,deleteUser);

module.exports = router;
