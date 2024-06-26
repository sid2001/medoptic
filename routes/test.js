const express = require('express');
const router = express.Router();
const {getUsers} = require('../controllers/test.js')

router.get('/users',getUsers);

// router.post('/registerTags',registerTags);

module.exports = router;