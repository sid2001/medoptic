const router = require('express').Router();
const {updateUserInfo,getUserInfo,registerUser,deleteUser,recordRfidScan,generateWeeklyReports} = require('../controllers/user.js');
const {verifyIdToken} = require('../middlewares/auth.js');

router.post('/updateUserInfo',verifyIdToken,updateUserInfo);

router.get('/getUserInfo',verifyIdToken,getUserInfo);

router.post('/register',verifyIdToken,registerUser);

router.post('/deleteUser',verifyIdToken,deleteUser);

router.post('/rfid/scan', recordRfidScan);

router.get('/rfid/reports/weekly', verifyIdToken, generateWeeklyReports);

module.exports = router;
