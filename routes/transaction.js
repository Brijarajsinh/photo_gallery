//requiring necessary packages
const express = require('express');
const router = express.Router();
const checkRole = require('../helpers/function');
const transactionModel = require('../schema/transactions');
const userController = require('../controller/users.controller');


//get Route to render dashboard page of the application after user registered successfully or user login successfully
router.get('/', checkRole.checkUser,userController.getTransactions)

module.exports = router;