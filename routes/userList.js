//requiring necessary packages
const express = require('express');
const router = express.Router();

const adminController = require('../controller/admin.controller');
//get Route to fetch current users
router.get('/', adminController.getUserList);


module.exports = router;

