const transactionModel = require('../schema/transactions');
//prepareSearchObj function returns searched criteria
exports.prepareSearchObj = async (search) => {
    const searchObj = {}
    if (search.amount) {
        //if user wants to search transaction by amount than searching is applied while fetching transactions records
        searchObj['searchAmount'] = search.amount;
    }
    if (search.txtType && search.txtType != 'all') {
        //if user filters transactions by type(welcome-bonus,referral-bonus,image-deduction)
        //than only that type of records are fetched from database
        searchObj['filterType'] = search.txtType;
    }
    if (search.status && search.status != 'all') {
        //if user filters transactions by action(credit,debit)
        //than only that type of records are fetched from database
        searchObj['filterStatus'] = search.status;
    }
    return searchObj;
};

//findObjTransaction function returns find object which is passed in find query of mongoose
exports.findObjTransaction = async (userId, search) => {
    const find = {
        "userId": userId
    };
    if (search.amount) {
        //if user wants to search transaction by amount than searching is applied while fetching transactions records
        find['amount'] = search.amount;
    }
    if (search.txtType && search.txtType != 'all') {
        //if user filters transactions by type(welcome-bonus,referral-bonus,image-deduction)
        //than only that type of records are fetched from database
        find['type'] = search.txtType;
    }
    if (search.status && search.status != 'all') {
        //if user filters transactions by action(credit,debit)
        //than only that type of records are fetched from database
        find['status'] = search.status;
    }
    return find;
};

//storeTransaction function stores transaction entry in transaction model
exports.storeTransaction = async (userId, status, amount, type, description) => {
    const transaction = new transactionModel({
        'userId': userId,
        'status': status,
        'amount': amount,
        'type': type,
        'description': description
    });
    await transaction.save();
}