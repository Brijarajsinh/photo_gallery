
//requiring node-forge package to encrypt password field of user collection
const forge = require('node-forge');
const md = forge.md.sha512.sha256.create();

//requiring model to work with collection of that models
const userModel = require('../schema/userSchema');
const settingModel = require('../schema/generalSettings');

module.exports = {
    //this function checks role of logged in user and according to role redirect to dashboard page
    redirectToDashboard: async function (req, res) {
        if (req.user.role == 'admin') {
            res.render('admin', {
                title: 'Dashboard'
            });
        }
        else {
            res.render('user', {
                title: 'Dashboard'
            });
        }
    },

    //referralBonus function returns referral bonus fetched from settings collection
    _getReferralBonus: async function () {
        const referralBonus = await settingModel.findOne({}, { "referralBonus": 1, "_id": 0 });
        return referralBonus.referralBonus;
    },

    //generatePasswordHash function returns hash code of user entered password
    generatePasswordHash: function (password) {
        return forge.md.sha512.sha256.create().update(password).digest().toHex();
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
    },

    //returns the pagination array 
    createPagination: async function (pages) {
        const page = [];
        for (let i = 1; i <= pages; i++) {
            page.push(i);
        }
        return page;
    },

    prepareSortObj: function (sort, sortBy) {
        const sortObj = {};
        if (sort) sortObj[sort] = sortBy == 'ASC' ? 1 : -1
        else sortObj._id = -1
        return sortObj;
    },

    //sendMail function sends mail to user for informing action performed by admin
    mailContent: async function (receiverObj, status) {
        const receiver = receiverObj.requestedBy.email;
        console.log("RECEIVER");
        console.log(receiver);
        from = 'mahidabrijrajsinh2910@gmail.com', // sender address
            to = `${receiver}`, // list of receivers
            subject = 'Withdrawal Request Status Updates', // Subject line
            text = `Withdrawal request is ${status}.`,
            html = await this._getMailMessage(receiverObj, status)
        return {
            //returns from,to,subject,text and html  value to the calling variable or function
            from,
            to,
            subject,
            text,
            html
        }
    },

    _getMailMessage: function (sendMailObj, status) {
        if (status == 'approved') {
            console.log("111111111");
            return `<h1>Congratulations ${sendMailObj.requestedBy.fullName},<h1><br>
            <h3>Your Withdrawal Request of ${sendMailObj.amount} coin is approved by admin of Photo Gallery Affiliate Marketing
            on ${sendMailObj.updatedOn}.
            </h3><br>
            <h4>Your Available Coins in Wallet is ${sendMailObj.requestedBy.availableCoins}.</h4>`
        }
        else {
            console.log("22222222");
            return `<h1>Sorry ${sendMailObj.requestedBy.fullName},<h1><br>
            <h3>Your Withdrawal Request of ${sendMailObj.amount} coin is rejected by admin of Photo Gallery Affiliate Marketing
            on ${sendMailObj.updatedOn}.
            </h3><br>
            <h4>Reason for Rejection of Withdrawal Request ${sendMailObj.description}.</h4>`
        }
    }
}

