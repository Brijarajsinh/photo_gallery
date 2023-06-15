const express = require('express');
const router = express.Router();
const { checkUser, checkAdmin } = require('../helpers/function');
const withdrawController = require('../controller/withdraw.controller');

//get Route /withdraw/request get all request to the admin
router.get('/admin/request', checkAdmin, withdrawController.getWithdrawRequestAdminSide);

//get Route to get reason of rejected withdraw request
router.get('/request/:reqId/reason',checkUser,withdrawController.getRejectionReason);

//get Route /withdraw/list get all request of logged-in user
router.get('/request', checkUser, withdrawController.getWithdrawRequestUserSide);

//post Route /withdraw to add withdraw request of user
router.post('/', checkUser, withdrawController.withdrawCoinRequest);

//put Route to change status of request from pending to cancelled
router.put('/request/:reqId/cancel', checkUser,withdrawController.cancelWithdrawRequest);

//put Route to change status of request from pending to approved or rejected
router.put('/admin/request/:reqId/:status', checkAdmin,withdrawController.updateWithdrawRequest);
    
module.exports = router;
