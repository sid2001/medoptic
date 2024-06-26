const router = require("express").Router();
const {getQtags,createQtags} = require("../controllers/qtags");
// const {adminVerify} = require('middlewares/auth');

router.get('/getQtags',getQtags);

router.post('/createQtags',createQtags);

module.exports = router;