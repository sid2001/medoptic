const router = require('express').Router();
const {updateUserInfo,getUserInfo} = require('../controllers/user.js');
const {verifyIdToken} = require('../middlewares/auth.js');

router.post('/updateUserInfo',verifyIdToken,updateUserInfo);

router.get('/getUserInfo',verifyIdToken,getUserInfo);

module.exports = router;
