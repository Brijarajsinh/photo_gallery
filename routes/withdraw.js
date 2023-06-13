const express = require('express');
const router = express.Router();
const withdrawModel = require('../schema/withdraw');
router.get('/', async function (req, res) {
    try {
        const sort = {
            "_id": -1
        }
        if (req.user.role == 'admin') {
            const withdrawRequest = await withdrawModel.find({}, {
                "_id": 1,
                "createdOn": 1,
                "amount": 1,
                "status": 1,
            }).sort(sort).lean();
            res.render('admin/withdraw', {
                title: 'Withdraw',
                requests: withdrawRequest
            });
        }
        else {
            const withdrawRequest = await withdrawModel.find({
                "userId": req.user._id
            }, {
                "_id": 1,
                "createdOn": 1,
                "amount": 1,
                "status": 1,
            }).sort(sort).lean();
            res.render('user/withdraw', {
                title: 'Withdraw',
                requests: withdrawRequest
            });
        }
    } catch (error) {
        console.log("Error Generated In rendering Withdraw Page");
        console.log(error);
        res.send({
            type: 'error',
            message: error.toString()
        });
    }
});

router.post('/', async function (req, res) {
    try {
        const withdrawRecord = new withdrawModel({
            "userId": req.user._id,
            "amount": req.body.amount
        });
        await withdrawRecord.save();

        res.send({
            type: 'success'
        });
    } catch (error) {
        console.log("Error generated In Withdraw Request");
        console.log(error);
        res.send({
            type: 'error',
            message: error.toString()
        });
    }
});
module.exports = router;
