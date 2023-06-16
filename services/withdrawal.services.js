
const UserModel = require('../schema/userSchema');
const mongoose = require("mongoose");
const { storeTransaction } = require('./transaction.services');

//deductWithdrawAmount service deduct withdrawal charge from user wallet and store transaction in transaction collection
exports.deductWithdrawAmount = async function (userId, amount) {
    await UserModel.updateOne({
        "_id": userId
    }, {
        $inc: {
            'availableCoins': -amount
        }
    });

    const description = `${amount} coins are withdraw`
    await storeTransaction(userId,'debit',amount,'withdrawal',description);
    //Store Entry In Transaction Model for withdrawal coin
    
    //using socket.io send notification to the user that admin uploads withdraw request status to approved from pending
    io.to('userRoom').emit('requestUpdate', {
        'userId': userId,
        'message': `Admin has Approved Your Withdraw Request of ${amount} coin`
    });
};

//returns search Object
exports.prepareSearchObj = async function (role, from, to, status, user) {
    const searchObj = {}
    if (from && to) {
        searchObj['from'] = from;
        searchObj['to'] = to;
    }
    if (status) {
        searchObj['filterType'] = status
    }
    else if (status == '') {
        searchObj['filterType'] = 'all'
    }
    else {
        if (role == 'admin') {
            searchObj['filterType'] = 'pending'
        }
    }
    if (user) {
        searchObj['filterUser'] = user
    }
    else {
        searchObj['filterUser'] = 'all'
    }
    return searchObj;
};

//prepare and returns find Object
exports.prepareFindObj = async function (role, from, to, status, user) {
    const findObj = {}
    if (role == 'user') findObj["userId"] = user
    else findObj.status = {
        $ne: 'cancelled'
    }
    if (from && to) {
        const start = new Date(from);
        const end = new Date(to);
        findObj.createdOn = {
            $gte: start,
            $lt: end
        }
    }
    if (status) {
        findObj['status'] = status
    }
    else {
        if (role == 'admin' && status != "") findObj['status'] = 'pending'
    }
    if (role == 'admin' && user) {
        findObj.userId = {
            $eq: new mongoose.Types.ObjectId(user)
        }
    }
    return findObj;
};