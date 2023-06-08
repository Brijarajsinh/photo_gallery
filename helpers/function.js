
//requiring node-forge package to encrypt password field of user collection
const forge = require('node-forge');
const md = forge.md.sha512.sha256.create();

//requiring model to work with collection of that models
const userModel = require('../schema/userSchema');
const settingModel = require('../schema/generalSettings');
const transactionModel = require('../schema/transactions');

module.exports = {

    //referralBonus function returns referral bonus fetched from settings collection
    _getReferralBonus: async function () {
        const referralBonus = await settingModel.findOne({}, { "referralBonus": 1, "_id": 0 });
        return referralBonus.referralBonus;
    },

    //generatePasswordHash function returns hash code of user entered password
    generatePasswordHash: function (password) {
        return forge.md.sha512.sha256.create().update(password).digest().toHex();
    },


    getSettings:async function(){
       return await settingModel.findOne({}, {
            "_id": 0,
            "chargePerImage": 1,
            "maxRefer": 1,
            "referralBonus": 1,
            "welcomeBonus": 1
        }).lean();
        
    },
    
    //applySettings function returns updated settings value's object with key
    applySettings: function (req) {
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
    },

    //applyReferBonus function applies referral bonus to the applicable user
    applyReferBonus: async function (user) {
        const _this = this;
        const referralBonus = await this._getReferralBonus()
        await userModel.updateOne({
            "_id": user
        },
            {
                $inc: {
                    "availableCoins": referralBonus,
                    "referralUsers": 1
                }

            });

        //Store Entry In Transaction Model To Track User's Wallet Transactions
        const transaction = await new transactionModel({
            'userId': user,
            'status': 'credit',
            'amount': referralBonus,
            'type': `referral-bonus`,
            'description':`${referralBonus} coins are credited for referring user`
        });
        await transaction.save();
    },
    //generateReferLink function generates unique referral code for referring to other user
    generateReferLink: async function (length) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numeric = '0123456789';
        let randomString = '';
        randomString += alphabet[Math.floor(Math.random() * alphabet.length)];
        for (let i = 1; i < length; i++) {
            randomString += numeric[Math.floor(Math.random() * numeric.length)];
        }

        const existsReferral = await userModel.findOne({
            'referLink': randomString
        })
        if (existsReferral) {
            this.generateReferLink(6)
        }
        else {
            return randomString;
        }
    },

    //getWelcomeBonus function returns welcome bonus fetched from settings collection
    getWelcomeBonus: async function () {
        const welcomeBonus = await settingModel.findOne({}, { "welcomeBonus": 1, "_id": 0 });
        return welcomeBonus.welcomeBonus;
    },

    //getReferralCount function returns referral user's Count fetched from settings collection
    getReferralCount: async function () {
        const referralCount = await settingModel.findOne({}, { "maxRefer": 1, "_id": 0 });
        return referralCount.maxRefer;
    },

    //getAvailableCoins function returns available coins of current logged-in user
    getAvailableCoins: async function (userId) {
        const availableCoins = await userModel.findOne({ "_id": userId }, { "availableCoins": 1, "_id": 0 });
        return availableCoins.availableCoins;
    },

    //getImageUploadCharge function returns image deduction charge fetched from generalSettings collection
    getImageUploadCharge: async function () {
        const imageUploadCharge = await settingModel.findOne({}, { "chargePerImage": 1, "_id": 0 });
        return imageUploadCharge.chargePerImage;
    },


    //check admin function allows only admins to access functionality of admin role
    checkAdmin: async function (req, res, next) {
        if (req.user.role == 'admin') {
            return next();
        }
        return res.redirect('/dashboard');
    },

    //check user function allows only users to access functionality of user role
    checkUser: async function (req, res, next) {
        if (req.user.role == 'user') {
            return next();
        }
        return res.redirect('/dashboard');
    }
}