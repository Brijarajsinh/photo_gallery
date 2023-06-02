//requiring necessary packages
const express = require('express');
const router = express.Router();
const checkRole = require('../helpers/function');

const adminController = require('../controller/admin.controller');
//get Route to fetch current users
router.get('/', checkRole.checkAdmin, adminController.getUserList);

module.exports = router;

