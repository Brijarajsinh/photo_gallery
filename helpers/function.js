const moment = require('moment');
const approveWithdrawRequestTemplate = require('../config/mailTemplate.json')['approveWithdrawRequest'];
const rejectWithdrawRequestTemplate = require('../config/mailTemplate.json')['rejectWithdrawRequest'];
//requiring node-forge package to encrypt password field of user collection
const forge = require('node-forge');
const md = forge.md.sha512.sha256.create();

//requiring model to work with collection of that models
const userModel = require('../schema/userSchema');
const settingModel = require('../schema/generalSettings');

module.exports = {

    //this function checks role of logged in user and according to role redirect to dashboard page
    redirectToDashboard: async function (req, res) {
        const response = {
            title: 'Dashboard'
        }
        if (req.user.role == 'admin') return res.render('admin', response);
        return res.render('user', response);
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

    //prepares and returns sortObject with sort value and sort order
    prepareSortObj: function (sort, sortBy) {
        const sortObj = {};
        sort ? sortObj[sort] = sortBy == 'ASC' ? 1 : -1 : sortObj._id = -1
        return sortObj;
    },

    //mailContent function returns mail parameters of user for informing action performed by admin on pending withdrawal request
    mailContent: async function (receiverObj, status) {

        //receiver e-mail id passed in receiverObj as parameter
        const receiver = receiverObj.requestedBy.email;

        //using mail-template get the text of sending mail like subject,text and html
        const sendingSubject = status == 'approved' ? approveWithdrawRequestTemplate.subject : rejectWithdrawRequestTemplate.subject;
        const sendingText = status == 'approved' ? approveWithdrawRequestTemplate.text : rejectWithdrawRequestTemplate.text;
        const sendingHtml = status == 'approved' ? approveWithdrawRequestTemplate.html : rejectWithdrawRequestTemplate.html;

        //using moment module convert passed date in receiverObj as parameter to indian time-zone
        const requestedOn = this._dateConvertForSendMail(receiverObj.createdOn);
        const actionPerformedOn = this._dateConvertForSendMail(receiverObj.actionPerformedOn);

        //prepare replaceObj which will passed in _parseString function to replace variable from key to value
        const replaceObj = {
            "status": status,
            "fullName": receiverObj.requestedBy.fullName,
            "amount": receiverObj.amount,
            "createdOn": requestedOn,
            "availableCoins": receiverObj.requestedBy.availableCoins,
            "actionPerformedOn": actionPerformedOn,
            "description": receiverObj.description
        }

        from = 'mahidabrijrajsinh2910@gmail.com', // sender address
            to = `${receiver}`, // list of receivers
            subject = this._parseString(sendingSubject, replaceObj),// subject of receiver's mail
            text = this._parseString(sendingText, replaceObj),// text of receiver's mail
            html = this._parseString(sendingHtml, replaceObj)// html of receiver's mail

        return {
            //returns from,to,subject,text and html  value to the calling variable or function
            from,
            to,
            subject,
            text,
            html
        }
    },

    //_parseString function returns parsed string from mail-template string to required message string which will be sent in sendMail function of nodeMailer
    _parseString: function (str, data) {
        for (let index in data) {
            const match = '${' + index + '}'
            str = str.replace(match, data[index]);
        }
        return str
    },

    //_dateConvertForSendMail function converts date of requested withdraw-requested and action-performed by admin in indian time zone from UTC
    _dateConvertForSendMail: function (date1) {
        return moment(date1).format('DD/MM/YYYY, h:mm a');
    }
}

