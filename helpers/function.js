
//requiring node-forge package to encrypt password field of user collection
const forge = require('node-forge');
const md = forge.md.sha512.sha256.create();

//requiring model to work with collection of that models
const userModel = require('../schema/userSchema');
const settingModel = require('../schema/generalSettings');

module.exports = {

    //referralBonus function returns referral bonus fetched from settings collection
    _referralBonus: async function () {
        const referralBonus = await settingModel.findOne({}, { "referralBonus": 1, "_id": 0 });
        return referralBonus.referralBonus;
    },

    //generatePasswordHash function returns hash code of user entered password
    generatePasswordHash: function (password) {
        return forge.md.sha512.sha256.create().update(password).digest().toHex();
    },

    //applySettings function returns updated settings value's object with key
    applySettings: function (req) {
        const settings = {};
        if (req) {

        }
        else {
            settings.welcomeBonus = process.env.welcomeBonus,
                settings.referralBonus = process.env.referralBonus,
                settings.chargePerImage = process.env.chargePerImage,
                settings.maxRefer = process.env.maxRefer
        }
        return settings;
    },

    //applyReferBonus function applies referral bonus to the applicable user
    applyReferBonus: async function (user) {
        const _this = this;
        await userModel.updateOne({
            "_id": user
        },
            {
                $inc: {
                    "availableCoins": await this._referralBonus(),
                    "referralUsers": 1
                }

            });
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

    //welcomeBonus function returns welcome bonus fetched from settings collection
    welcomeBonus: async function () {
        const welcomeBonus = await settingModel.findOne({}, { "welcomeBonus": 1, "_id": 0 });
        return welcomeBonus.welcomeBonus;
    },

    //referralCount function returns referral user's Count fetched from settings collection
    referralCount: async function () {
        const referralCount = await settingModel.findOne({}, { "maxRefer": 1, "_id": 0 });
        return referralCount.maxRefer;
    },

    //check admin function allows only admins to access functionality of admin role
    checkAdmin:async function(req,res,next){
        if(req.user.role == 'admin'){
            return next();
        }
        return res.redirect('/dashboard');
    
        
    },

    //check user function allows only users to access functionality of user role

    checkUser:async function(req,res,next){
        if(req.user.role == 'user'){
            return next();
        }
        return res.redirect('/dashboard');
    }
}