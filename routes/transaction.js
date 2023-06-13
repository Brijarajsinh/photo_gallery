//requiring necessary packages
const express = require('express');
const router = express.Router();
const { checkUser } = require('../helpers/function');
const userController = require('../controller/users.controller');


//get Route to render dashboard page of the application after user registered successfully or user login successfully
router.get('/', checkUser, userController.getTransactions)

module.exports = router;