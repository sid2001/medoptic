const router = require('express').Router();
const {getTemplate,createTemplate,updateTemplate,deleteTemplate}  = require('../controllers/template');
const {verifyIdToken} = require('../middlewares/auth');

//router.get('/getTemplate/:templateId',verifyIdToken,getTemplate);

//router.get('/getAllTemplates',verifyIdToken,getTemplate);

router.post('/createTemplate',verifyIdToken,createTemplate);

router.post('/updateTemplate/:templateId',verifyIdToken,updateTemplate);

router.post('/deleteTemplate/:templateId',verifyIdToken,deleteTemplate);

module.exports = router