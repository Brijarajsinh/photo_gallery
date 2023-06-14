const express = require('express');
const router = express.Router();
const { checkUser, checkAdmin } = require('../helpers/function');
const withdrawModel = require('../schema/withdraw');
const UserModel = require('../schema/userSchema');
const transactionModel = require('../schema/transactions');
const commonFunction = require('../helpers/function');

router.get('/request', async function (req, res) {
    try {
        console.log("QUERY");
        console.log(req.query);
        console.log("BODY");
        console.log(req.body);
        // const find = await galleryService.findObjImages(req.user._id, req.query);
        // const search = await galleryService.searchedDetails(req.query);
        // const sort = await galleryService.sortObj(req.query.sort, req.query.sortOrder);
        // const sort = {
        //     "_id": -1
        // }
        const find = {}
        const search = {}
        const sort = {}

        if (req.query.sort) {
            sort[`${req.query.sort}`] = req.query.sortOrder == 'ASC' ? 1 : -1
        }
        else {
            sort['_id'] = -1;
        }
        if (req.query.from && req.query.to) {
            const start = new Date(req.query.from);
            const end = new Date(req.query.to);
            console.log(start, end);
            find.createdOn = {
                $gte: start,
                $lt: end
            }
            search['from'] = req.query.from;
            search['to'] = req.query.to;
        }

        if (req.query.status) {
            find['status'] = req.query.status
            search['filterType'] = req.query.status
        }
        else {
            search['filterType'] = 'all'
        }
        const pageSkip = (Number(req.query.page)) ? Number(req.query.page) : 1;
        const limit = 2;
        const skip = (pageSkip - 1) * limit;
        if (req.user.role == 'admin') {
            find['status'] = 'pending';
        }
        else {
            find['userId'] = req.user._id
        }
        const withdrawRequest = await withdrawModel.find(find, {
            "_id": 1,
            "userId": 1,
            "createdOn": 1,
            "amount": 1,
            "status": 1,
        }).sort(sort).skip(skip).limit(limit).lean();
        console.log("ANSWER ANSWER ANSWER");
        console.log(find);
        console.log(withdrawRequest);
        const totalRequests = await withdrawModel.countDocuments(find);
        const pageCount = Math.ceil(totalRequests / limit);
        const page = await commonFunction.createPagination(pageCount);

        const response = {
            title: 'Withdraw',
            requests: withdrawRequest,
            page: page,
            currentPage: pageSkip
        }

        if (req.xhr) {
            response['layout'] = 'blank';
            response['search'] = search;
        }
        if (req.user.role == 'admin') {
            res.render('admin/withdraw', response);
        }
        else {
            res.render('user/withdraw', response);
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

router.post('/', checkUser, async function (req, res) {
    try {
        const withdrawRecord = new withdrawModel({
            "userId": req.user._id,
            "amount": req.body.amount
        });
        await withdrawRecord.save();

        //using socket.io send notification to the user that admin uploads withdraw request status to rejected from pending
        io.to('adminRoom').emit('withdrawRequest', {
            'userName': req.user.fullName
        });
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
            res.render('admin/withdraw',{
                layout:'blank'
            });
        }
        else {
            res.render('user/withdraw',{
                layout:'blank'
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
