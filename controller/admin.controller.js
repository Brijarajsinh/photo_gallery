//requiring model to work with collection of that models
const settingModel = require('../schema/generalSettings');
const userModel = require('../schema/userSchema');
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

exports.prepareUserStatistics = async (req, res) => {
    try {
        const start = req.query.from ? req.query.from : moment(Date.now()).subtract(6, 'd').format('yyyy-MM-DD');
        const end = req.query.to ? req.query.to : moment(Date.now()).format('yyyy-MM-DD');
        const searchObj = {};
        const dateArray = [];
        const users = [];
        searchObj.from = start;
        searchObj.to = end;

        // console.log(Date(start));
        // console.log(Date(end));

        // console.log(moment(Date(start), 'yyyy-MM-DD 00:00:00z').utc());
        // console.log(moment(Date(start), 'yyyy-MM-DD 23:59:59z').utc().endOf());

        for (let i = Number(start.slice(-2)); i <= Number(end.slice(-2)); i++) {
            const year = Number(start.slice(0, 4))
            const month = Number(start.slice(5, 7))
            const date = `${i}/${month}/${year}`
            dateArray.push(date);
        }
        const user = await userModel.aggregate([
            {
                $group: {
                    _id: {
                        day: { $dayOfMonth: "$createdOn" },
                        month: { $month: "$createdOn" },
                        year: { $year: "$createdOn" }
                    },
                    total: {
                        $sum: 1
                    }
                }
            }
        ]);
        console.log(user);
        res.send({
            type: 'success',
            search: searchObj,
            dateArray: dateArray,
            //countUserArray: users
        });
    } catch (error) {
        console.log("Error Generated While Admin Created User-statistics");
        console.log(error);
        res.send({
            type: 'error'
        });
    }
};