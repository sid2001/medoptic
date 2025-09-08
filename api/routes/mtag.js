const router = require('express').Router();
const {createMtag,getMtag,verifyMtagId,registerRFID} = require('../controllers/mtag.js');
const {verifyIdToken} = require('../middlewares/auth.js');

router.post('/createMtag/:mtagId',verifyIdToken,createMtag);
router.post('/registerRFID',verifyIdToken,registerRFID);

// router.post('/updateMtag/:mtagId', verifyIdToken, updateMtag);

router.get('/getMtag/:mtagId', getMtag);

router.get('/mtagIdValid/:mtagId', verifyIdToken, verifyMtagId);

module.exports = router;