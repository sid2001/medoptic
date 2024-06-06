const express = require('express');
const router = express.Router();
const {getUsers} = require('../controllers/test.js')

router.get('/users',getUsers);

module.exports = router;