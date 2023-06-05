const settingModel = require('../schema/generalSettings');
const userModel = require('../schema/userSchema');

//this controller fetches current general-settings
exports.getGeneralSettings = async (req, res, next) => {
    try {
        const currentDetails = await settingModel.findOne({}, {
            "_id": 0,
            "chargePerImage": 1,
            "maxRefer": 1,
            "referralBonus": 1,
            "welcomeBonus": 1
        }).lean();
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

//this controller updates general setting in database
exports.updateGeneralSettings = async (req, res, next) => {
    try {
        await settingModel.updateOne({},
            req.body
        )
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
exports.getUserList = async (req, res, next) => {

    try {
        const find = {
            role: "user"
        };
        const sort = {};
        const pageSkip = (Number(req.query.page)) ? Number(req.query.page) : 1;
        const limit = 10;
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
            sort[req.query.sort] = req.query.sortOrder
        }
        else {
            sort._id = 1
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
        const page = [];
        for (let i = 1; i <= pageCount; i++) {
            page.push(i);
        }


        //if this route is called using ajax request than load data through partials
        if (req.xhr) {

            //render userList page to display list of users
            res.render('admin/userList', {
                title: 'Users',
                users: currentUsers,
                page: page,
                layout: 'blank',
                searchValue: req.query.search
            });
        }
        //otherwise load data through rendering report page
        else {
            //render userList page to display list of users
            res.render('admin/userList', {
                title: 'Users',
                users: currentUsers,
                page: page
            });
        }
    } catch (error) {
        console.log("Error Generated While Admin access userList Page");
        console.log(error);
    }
};