const withdrawModel = require('../schema/withdraw');
const UserModel = require('../schema/userSchema');
const commonFunction = require('../helpers/function');
const withdrawService = require('../services/withdrawal.services');

//getWithdrawRequestAdminSide function fetches all withdrawal request of all user and display requests user side
//on selection of user and filter by status fetches that selected filter's withdrawal requests
exports.getWithdrawRequestAdminSide = async (req, res) => {
    try {
        const find = await withdrawService.prepareFindObj(req.user.role, req.query.from, req.query.to, req.query.status, req.query.user);
        const search = await withdrawService.prepareSearchObj(req.user.role, req.query.from, req.query.to, req.query.status, req.query.user);
        const sort = await commonFunction.prepareSortObj(req.query.sort, req.query.sortOrder);
        const pageSkip = (Number(req.query.page)) ? Number(req.query.page) : 1;
        const limit = 4;
        const skip = (pageSkip - 1) * limit;

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

//updateWithdrawRequest function update the withdrawal request's status from pending to approve according to action performed by admin
exports.updateWithdrawRequest = async (req, res) => {
    try {
        const reqId = req.params.reqId;
        const status = req.params.status;
        const userId = req.body.userId;
        const amount = req.body.amount;
        const requestDetails = {
            'status': status,
        }
        //Admin perform reject action on pending withdrawal request
        if (req.body.reason) {
            requestDetails['description'] = req.body.reason
            //using socket.io send notification to the user that admin uploads withdraw request status to rejected from pending
            io.to('userRoom').emit('requestUpdate', {
                'userId': userId,
                'message': `Admin has Rejected Your Withdraw Request of ${amount}`
            });
        }
        //Admin perform reject action on pending withdrawal request
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
            else {
                //else deduct requested coins from user's wallet and store hte entry in transaction collection
                await withdrawService.deductWithdrawAmount(userId, amount);
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

//getWithdrawRequestUserSide function get all withdrawal request of current logged-in user
exports.getWithdrawRequestUserSide = async (req, res) => {
    try {
        const find = await withdrawService.prepareFindObj(req.user.role, req.query.from, req.query.to, req.query.status, req.user._id);
        const search = await withdrawService.prepareSearchObj(req.user.role, req.query.from, req.query.to, req.query.status);
        const sort = await commonFunction.prepareSortObj(req.query.sort, req.query.sortOrder);
        const pageSkip = (Number(req.query.page)) ? Number(req.query.page) : 1;
        const limit = 2;
        const skip = (pageSkip - 1) * limit;

        const withdrawRequest = await withdrawModel.find(find, {
            "_id": 1,
            "userId": 1,
            "createdOn": 1,
            "amount": 1,
            "status": 1,
            "description":1
        }).sort(sort).skip(skip).limit(limit).lean();
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

//stores withdrawal request with status pending in withdraw collection with amount and requestedBy
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

//user wants to cancel pending request that cancelWithdrawRequest function is called
//and update that request status from pending to cancelled
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

//getRejectionReason function returns the description for rejecting withdrawal request and show reason to user
exports.getRejectionReason = async (req, res) => {
    try {
        const reason = await withdrawModel.findOne({
            "_id": req.params.reqId
        }, {
            '_id': 1,
            'description': 1
        });
        res.render('user/withdraw', {
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