const router = require('express').Router();
const {postMtag,getMtag,updateMtag} = require('../controllers/user.js');
const {verifyIdToken} = require('../middlewares/auth.js');

router.post('/createMtag',verifyIdToken,postMtag);

router.post('/updateMtag/:mtagId', verifyIdToken, updateMtag);

router.get('/getMtag/:mtagId', getMtag);

module.exports = router;