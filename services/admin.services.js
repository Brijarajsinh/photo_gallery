const settingModel = require('../schema/generalSettings');

//returns the current applied general-setting
exports.getSettings = async function () {
    return await settingModel.findOne({}, {
        "_id": 0,
        "chargePerImage": 1,
        "maxRefer": 1,
        "referralBonus": 1,
        "welcomeBonus": 1
    }).lean();
};

//applySettings function returns updated settings value's object with key
exports.applySettings = function (req) {
    if (req) {
        //if admin wants to apply general setting than passed parameters are applied and
        //returns an object which consists update value of general settings
        const settings = req;
        return settings;
    }
    else {
        //Otherwise set a general settings value from the env variable
        const settings = {
            welcomeBonus: process.env.welcomeBonus,
            referralBonus: process.env.referralBonus,
            chargePerImage: process.env.chargePerImage,
            maxRefer: process.env.maxRefer
        }
        return settings;
    }
};

//Prepares and returns searching object to fetch details of users in user-list table
exports.findObj = function (searchVal) {
    const findObj = {
        role: "user"
    }
    //if req.query.search consists value than searching applied parameter applies to fetch records from Database
    if (searchVal) {
        findObj.$or = [
            {
                "fname": {
                    $regex: searchVal
                }
            },
            {
                "lname": {
                    $regex: searchVal
                }
            },
            {
                "fullName": {
                    $regex: searchVal
                }
            }
        ]
    }
    return findObj;
};