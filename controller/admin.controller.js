//requiring model to work with collection of that models
const settingModel = require('../schema/generalSettings');
const userModel = require('../schema/userSchema');
const functionUsage = require('../helpers/function');


//applySettings function updates general settings
const { applySettings } = require('../helpers/function');

//getSettings function fetches current general-setting  from db
const { getSettings } = require('../helpers/function');


//getGeneralSettings function fetches current general-settings
exports.getGeneralSettings = async (req, res, next) => {
    try {
        const currentDetails = await getSettings();
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
        const settings = await applySettings(req.body);
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
        const find = {
            role: "user"
        };
        const sort = {};
        const pageSkip = (Number(req.query.page)) ? Number(req.query.page) : 1;
        const limit = 2;
        const skip = (pageSkip - 1) * limit;
        //if req.query.search consists value than searching applied parameter applies to fetch records from Database
        if (req.query.search) {
            find.$or = [
                {
                    "fname": {
                        $regex: req.query.search
                    }
                },
                {
                    "lname": {
                        $regex: req.query.search
                    }
                },
                {
                    "fullName": {
                        $regex: req.query.search
                    }
                }
            ]
        }
        if (req.query.sort) {
            sort[req.query.sort] = req.query.sortOrder == 'ASC' ? 1 : -1
        }
        else {
            sort._id = -1
        }
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
        const page = await functionUsage.createPagination(pageCount);
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

