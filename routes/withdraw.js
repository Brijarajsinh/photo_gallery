const express = require('express');
const router = express.Router();
const { checkUser, checkAdmin } = require('../helpers/function');
const withdrawController = require('../controller/withdraw.controller');

//get Route /withdraw/request get all request to the admin
router.get('/request', checkAdmin,withdrawController.getWithdrawRequestAdminSide);

//get Route /withdraw/list get aall request of logged-in user
router.get('/list', checkUser,withdrawController.getWithdrawRequestUserSide);

//post Route /withdraw to add withdraw request of user
router.post('/', checkUser,withdrawController.withdrawCoinRequest);

router.put('/', async function (req, res) {
    try {
        const reqId = req.body.reqId;
        const userId = req.body.userId;
        const amount = req.body.amount;
        const requestDetails = {
            'status': req.body.status,
        }
        if (req.body.reason) {
            requestDetails['description'] = req.body.reason
            //using socket.io send notification to the user that admin uploads withdraw request status to rejected from pending
            io.to('userRoom').emit('requestUpdate', {
                'userId': userId,
                'message': 'Admin has Rejected Your Withdraw Request'
            });
        }
        else if (req.body.status == 'cancelled') {
            await withdrawModel.updateOne({
                "_id": reqId
            }, requestDetails);
        }
        else {
            //deduct requested coins from user's wallet
            await UserModel.updateOne({
                "_id": userId
            }, {
                $inc: {
                    'availableCoins': -amount
                }
            });
            //Store Entry In Transaction Model for withdrawal coin
            const transaction = await new transactionModel({
                'userId': userId,
                'status': 'debit',
                'amount': amount,
                'type': `withdrawal`,
                'description': `${amount} coins are withdraw`
            });
            await transaction.save();
            //using socket.io send notification to the user that admin uploads withdraw request status to approved from pending
            io.to('userRoom').emit('requestUpdate', {
                'userId': userId,
                'message': 'Admin has Approved Your Withdraw Request'
            });

            await withdrawModel.updateOne({
                "_id": reqId
            }, requestDetails);
        }
        if (req.user.role == 'admin') {
            res.render('admin/withdraw', {
                layout: 'blank'
            });
        }
        else {
            res.render('user/withdraw', {
                layout: 'blank'
            });
        }
    } catch (error) {
        console.log("Error generated while updating status of withdraw request");
        console.log(error);
        res.send({
            type: 'error',
            message: error.toString()
        });
    }
});
module.exports = router;
