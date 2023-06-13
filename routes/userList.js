//requiring necessary packages
const express = require('express');
const router = express.Router();
const { checkAdmin } = require('../helpers/function');
const { getUserList } = require('../controller/admin.controller');

//get Route to fetch current users
router.get('/', checkAdmin, getUserList);

module.exports = router;