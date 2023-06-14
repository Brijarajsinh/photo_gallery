const withdrawModel = require('../schema/withdraw');
const UserModel = require('../schema/userSchema');
const transactionModel = require('../schema/transactions');
const commonFunction = require('../helpers/function');
exports.getWithdrawRequestAdminSide = async (req, res) => {
    try {
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
        else {
            find['status'] = 'pending'
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
};

exports.getWithdrawRequestUserSide = async (req, res) => {
    try {
        const userId = req.user._id;
        // const find = await galleryService.findObjImages(req.user._id, req.query);
        // const search = await galleryService.searchedDetails(req.query);
        // const sort = await galleryService.sortObj(req.query.sort, req.query.sortOrder);
        // const sort = {
        //     "_id": -1
        // }
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