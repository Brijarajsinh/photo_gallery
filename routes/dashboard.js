//requiring necessary packages
const express = require('express');
const router = express.Router();
const { redirectToDashboard, checkAdmin, checkUser } = require('../helpers/function');
const { prepareUserStatistics, prepareWithdrawalStatistics } = require('../controller/admin.controller');
const { prepareTransactionStatistics } = require('../controller/users.controller');
//get Route to render dashboard page of the application after user registered successfully or user login successfully
router.get('/', redirectToDashboard);

//get /admin/user-statistics Route to create registered user's statistics
router.get('/admin/user-statistics', checkAdmin, prepareUserStatistics);

//get Route /admin/approved-request-statistics to create approved withdrawal request by admin statistics
router.get('/admin/approved-request-statistics', checkAdmin, prepareWithdrawalStatistics);

router.get('/user/transaction-statistics', checkUser, prepareTransactionStatistics);

module.exports = router;