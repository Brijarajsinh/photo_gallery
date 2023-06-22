//requiring model to work with collection of that models
const settingModel = require('../schema/generalSettings');
const userModel = require('../schema/userSchema');
const withdrawModel = require('../schema/withdraw');
const commonFunction = require('../helpers/function');
const moment = require('moment');

//requiring admin services to get current setting,apply current setting prepares find object with search value and prepares sortObj to perform sorting
const adminServices = require('../services/admin.services');
const { success } = require('toastr');

//getGeneralSettings function fetches current general-settings
exports.getGeneralSettings = async (req, res, next) => {
    try {
        const currentDetails = await adminServices.getSettings();
        res.render('admin/settings', {
            title: 'Settings',
            currentDetails: currentDetails
        });
    } catch (error) {
        console.log("Error Generated While fetching current setting details");
        res.send({
            type: 'error'
        });
    }
};

//updateGeneralSettings controller updates general setting in database
exports.updateGeneralSettings = async (req, res, next) => {
    try {
        const settings = await adminServices.applySettings(req.body);
        await settingModel.updateOne({}, { $set: settings }, { upsert: true });
        res.send({
            type: 'success'
        });

    } catch (error) {
        console.log("Error Generated While Updating General Settings");
        res.send({
            type: 'error',
            message: error.toString()
        })
    }
};

//getUserList controller displays users of photo gallery application
exports.getUserList = async (req, res) => {
    try {
        const find = await adminServices.prepareFindObj(req.query.search);
        const sort = await commonFunction.prepareSortObj(req.query.sort, req.query.sortOrder);
        const pageSkip = (Number(req.query.page)) ? Number(req.query.page) : 1;
        const limit = 2;
        const skip = (pageSkip - 1) * limit;

        const currentUsers = await userModel.find(
            find
            , {
                "_id": 0,
                "fullName": 1,
                "email": 1,
                "availableCoins": 1,
                "referralUsers": 1,
            }).sort(sort).skip(skip).limit(limit).lean();

        //find total count of users
        const totalUsers = await userModel.countDocuments(
            find
        );
        //generates pages by dividing total users displayed in one page
        const pageCount = Math.ceil(totalUsers / limit);
        const page = await commonFunction.createPagination(pageCount);
        const response = {
            title: 'Users',
            users: currentUsers,
            page: page,
            currentPage: pageSkip
        }
        //if this route is called using ajax request than load data through blank layout
        if (req.xhr) {
            response['layout'] = 'blank';
            response['searchValue'] = req.query.search;
        }
        //otherwise load data through main layout
        res.render('admin/user-list', response);
    } catch (error) {
        console.log("Error Generated While Admin access userList Page");
        console.log(error);
    }
};

//prepareUserStatistics prepares two array and send them as response to create graph of user registered statistics
exports.prepareUserStatistics = async (req, res) => {
    try {

        //if range passed in query than get that 
        //otherwise range is upto last 7 day from current day
        const start = req.query.from ? req.query.from : moment(Date.now()).subtract(6, 'd').format('yyyy-MM-DD');
        const end = req.query.to ? req.query.to : moment(Date.now()).format('yyyy-MM-DD');

        //creating searchObj which is passed in response to set filtered value is selected
        const searchObj = {
            from: start,
            to: end
        };

        const dateArray = [];
        const conditionOnGetRecord = {};

        let totalDates = moment(end).diff(moment(start), 'days') + 1;
        const dateFormat = totalDates > 30 ? 'MMM-YYYY' : 'DD-MM-YYYY'

        if (totalDates > 30) {
            totalDates = moment(end).diff(moment(start), 'months', true) + 1;
            totalDates = Math.ceil(totalDates);
            conditionOnGetRecord.month = {
                $month: '$createdOn'
            }
            conditionOnGetRecord.year = {
                $year: '$createdOn'
            }
            //prepare initial array with default value 0 upto count of selected dates by admin
            for (let i = 0; i < totalDates; i++) {
                dateArray.push(moment(start).add(i, 'months').format(dateFormat))
            }
        } else {
            conditionOnGetRecord.day = {
                $dayOfMonth: '$createdOn'
            }
            conditionOnGetRecord.month = {
                $month: '$createdOn'
            }
            conditionOnGetRecord.year = {
                $year: '$createdOn'
            }
            //prepare initial array with default value 0 upto count of selected dates by admin
            for (let i = 0; i < totalDates; i++) {
                dateArray.push(moment(start).add(i, 'days').format(dateFormat))
            }
        }
        const users = Array(totalDates).fill(0);
        //fetch users from db which is registered in between the range
        const user = await userModel.aggregate([
            {
                $match: {
                    'role': "user"
                }
            },
            {
                $group: {
                    _id: conditionOnGetRecord,
                    date: { $first: "$createdOn" },
                    total: {
                        $sum: 1
                    }
                }
            }
        ]);
        //updating users array with registered-user's count and pass that array in response for creating y-axis of graph
        for (let index of user) {
            const indexOF = dateArray.indexOf(moment(index.date).format(dateFormat))
            if (indexOF > -1) users[indexOF] = index.total
        }
        res.send({
            type: 'success',
            search: searchObj,
            dateArray: dateArray,
            countUserArray: users
        });
    } catch (error) {
        console.log("Error Generated While Admin Created User-statistics");
        console.log(error);
        res.send({
            type: 'error'
        });
    }
};

//prepareWithdrawalStatistics prepares two array for creating statistics of withdrawal amount approved
exports.prepareWithdrawalStatistics = async (req, res) => {
    try {

        //if range passed in query than get that 
        //otherwise range is upto last 7 day from current day
        const start = req.query.from ? req.query.from : moment(Date.now()).subtract(6, 'd').format('yyyy-MM-DD');
        const end = req.query.to ? req.query.to : moment(Date.now()).format('yyyy-MM-DD');


        //creating searchObj which is passed in response to set filtered value is selected
        const searchObj = {
            from: start,
            to: end
        };
        const dateArray = [];
        const conditionOnGetRecord = {};

        //prepare initial array with default value 0 upto count of selected dates by admin
        let totalDates = moment(end).diff(moment(start), 'days') + 1;
        const dateFormat = totalDates > 30 ? 'MMM-YYYY' : 'DD-MM-YYYY'

        if (totalDates > 30) {
            totalDates = moment(end).diff(moment(start), 'months', true) + 1;
            totalDates = Math.ceil(totalDates);
            conditionOnGetRecord.month = {
                $month: '$updatedOn'
            }
            conditionOnGetRecord.year = {
                $year: '$updatedOn'
            }
            //prepare initial array with default value 0 upto count of selected dates by admin
            for (let i = 0; i < totalDates; i++) {
                dateArray.push(moment(start).add(i, 'months').format(dateFormat))
            }
        }
        else {
            conditionOnGetRecord.day = {
                $dayOfMonth: '$updatedOn'
            }
            conditionOnGetRecord.month = {
                $month: '$updatedOn'
            }
            conditionOnGetRecord.year = {
                $year: '$updatedOn'
            }
            //prepare initial array with default value 0 upto count of selected dates by admin
            for (let i = 0; i < totalDates; i++) {
                dateArray.push(moment(start).add(i, 'days').format(dateFormat))
            }
        }

        const amount = Array(totalDates).fill(0);

        //fetch approved withdrawal request from db which is approved by admin in that range
        const withdrawRequest = await withdrawModel.aggregate([
            {
                $match: {
                    'status': "approved"
                }
            },
            {
                $group: {
                    _id: conditionOnGetRecord,
                    date: { $first: "$updatedOn" },
                    total: {
                        $sum: "$amount"
                    }
                }
            }
        ]);

        //updating amount array with withdrawal-amount and pass that array in response for creating y-axis of graph
        for (let index of withdrawRequest) {
            const indexOF = dateArray.indexOf(moment(index.date).format(dateFormat))
            if (indexOF > -1) amount[indexOF] = index.total
        }
        res.send({
            type: 'success',
            search: searchObj,
            WithdrawDateArray: dateArray,
            countAmountArray: amount
        });

    } catch (error) {
        console.log("Error Generated While Admin Access Route to Create Statistics for Withdrawal-Request Amount Approved");
        console.log(error);
        res.send({
            type: 'error',
            message: error
        });
    }
};