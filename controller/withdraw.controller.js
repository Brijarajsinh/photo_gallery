const withdrawModel = require('../schema/withdraw');
const UserModel = require('../schema/userSchema');
const transactionModel = require('../schema/transactions');
const commonFunction = require('../helpers/function');
const mongoose = require("mongoose");

exports.getWithdrawRequestAdminSide = async (req, res) => {
    try {
        const find = {
            'status': {
                $ne: 'cancelled'
            }
        }
        const search = {}
        const sort = {}
        const pageSkip = (Number(req.query.page)) ? Number(req.query.page) : 1;
        const limit = 4;
        const skip = (pageSkip - 1) * limit;

        //sorting
        if (req.query.sort) {
            sort[`${req.query.sort}`] = req.query.sortOrder == 'ASC' ? 1 : -1
        }
        else {
            sort['_id'] = -1;
        }

        //filtering date wise
        if (req.query.from && req.query.to) {
            const start = new Date(req.query.from);
            const end = new Date(req.query.to);
            find.createdOn = {
                $gte: start,
                $lt: end
            }
            search['from'] = req.query.from;
            search['to'] = req.query.to;
        }

        //filtering on status
        if (req.query.status) {
            find['status'] = req.query.status
            search['filterType'] = req.query.status
        }
        else if (req.query.status == '') {
            search['filterType'] = 'all'
        }
        else {
            find['status'] = 'pending'
            search['filterType'] = 'pending'
        }

        //filter by user
        if (req.query.user) {
            find.userId = {
                $eq: new mongoose.Types.ObjectId(req.query.user)
            }
            search['filterUser'] = req.query.user
        }
        else {
            search['filterUser'] = 'all'
        }
        const users = await UserModel.find({ "role": 'user' }, { "_id": 1, "fullName": 1 }).lean();
        const withdrawRequest = await withdrawModel.aggregate([
            {
                $match: find
            },
            {
                $lookup: {
                    from: "users",
                    let: { userId: "$userId" },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                    { $eq: ["$_id", "$$userId"] },
                            }
                        },
                        { $project: { _id: 1, fullName: 1 } }
                    ],
                    as: "requestedBy"
                },
            },
            {
                $project: {
                    "_id": 1,
                    "userId": 1,
                    "createdOn": 1,
                    "amount": 1,
                    "status": 1,
                    'requestedBy': { $arrayElemAt: ["$requestedBy", 0] }
                }
            },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit }
        ])
        const totalRequests = await withdrawModel.countDocuments(find);
        const pageCount = Math.ceil(totalRequests / limit);
        const page = await commonFunction.createPagination(pageCount);
        const response = {
            title: 'Withdraw',
            users: users,
            requests: withdrawRequest,
            page: page,
            currentPage: pageSkip
        }
        if (req.xhr) {
            response['layout'] = 'blank';
            response['search'] = search;
        }
        res.render('admin/withdraw', response);
    } catch (error) {
        console.log("Error Generated In rendering Withdraw Page");
        console.log(error);
        res.send({
            type: 'error',
            message: error.toString()
        });
    }
};

exports.getWithdrawRequestUserSide = async (req, res) => {
    try {
        const userId = req.user._id;
        const find = {
            "userId": userId
        }
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
        else if (req.query.status == '') {
            search['filterType'] = 'all'
        }
        const pageSkip = (Number(req.query.page)) ? Number(req.query.page) : 1;
        const limit = 2;
        const skip = (pageSkip - 1) * limit;
        const withdrawRequest = await withdrawModel.find(find, {
            "_id": 1,
            "userId": 1,
            "createdOn": 1,
            "amount": 1,
            "status": 1,
        }).sort(sort).skip(skip).limit(limit).lean();
        const totalRequests = await withdrawModel.countDocuments(find);
        const pageCount = Math.ceil(totalRequests / limit);
        const page = await commonFunction.createPagination(pageCount);
        const response = {
            title: 'Withdraw',
            requests: withdrawRequest,
            page: page,
            currentPage: pageSkip,
            search: search
        }
        if (req.xhr) {
            response['layout'] = 'blank';
            response['search'] = search;
        }
        res.render('user/withdraw', response);
    } catch (error) {
        console.log("Error Generated In rendering Withdraw Page");
        console.log(error);
        res.send({
            type: 'error',
            message: error.toString()
        });
    }
};

exports.withdrawCoinRequest = async (req, res) => {
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
};

exports.cancelWithdrawRequest = async (req, res) => {
    try {
        const reqId = req.params.reqId;
        await withdrawModel.updateOne({
            "_id": reqId
        }, {
            "status": "cancelled"
        });
        res.send({
            type: 'success',
            reqId: reqId
        });
    } catch (error) {
        console.log("Error generated while updating status of withdraw request");
        console.log(error);
        res.send({
            type: 'error',
            message: error
        });
    }
};

exports.updateWithdrawRequest = async (req, res) => {
    try {
        const reqId = req.params.reqId;
        const status = req.params.status;
        const userId = req.body.userId;
        const amount = req.body.amount;
        const requestDetails = {
            'status': status,
        }
        if (req.body.reason) {
            requestDetails['description'] = req.body.reason
            //using socket.io send notification to the user that admin uploads withdraw request status to rejected from pending
            io.to('userRoom').emit('requestUpdate', {
                'userId': userId,
                'message': `Admin has Rejected Your Withdraw Request of ${amount}`
            });
        }
        else {
            const availableCoins = await commonFunction.getAvailableCoins(userId);
            //if requested amount is greater than available balance than throw an error with message
            if (amount > availableCoins) {
                //using socket.io send notification to the user that admin uploads withdraw request status to approved from pending
                io.to('userRoom').emit('requestUpdate', {
                    'userId': userId,
                    'message': `Admin can't Approve Your Withdraw Request,${amount} coin not available in your wallet.`
                });
                throw "Insufficient Balance to Withdraw"
            }
            //else deduct requested coins from user's wallet
            else {
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
                    'message': `Admin has Approved Your Withdraw Request of ${amount} coin`
                });
            }
        }
        await withdrawModel.updateOne({
            "_id": reqId
        }, requestDetails);
        res.send({
            type: 'success',
            reqId: reqId
        });
    } catch (error) {
        console.log("Error generated while updating status of withdraw request");
        console.log(error);
        res.send({
            type: 'error',
            message: error
        });
    }
};

exports.getRejectionReason = async (req, res) => {
    try {
        const reason = await withdrawModel.findOne({
            "_id": req.params.reqId
        }, {
            '_id': 1,
            'description': 1
        });
        res.render('user/withdraw',{
            reason: reason.description
        });
    } catch (error) {
        console.log("Error Generated While Getting Reason of Rejection Withdrawal Request");
        console.log(error);
        res.send({
            type: 'error',
            message: error.toString()
        });
    }
};