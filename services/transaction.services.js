//searchedDetails function returns searched criteria
exports.searchedDetails = async (search) => {
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

exports.sortObj = async (sort, sortOrder) => {
    if (sort) {
        //if user wants to sort transaction by field than add sort in mongoose query and sort results by that field
        sortObj = { sort: sortOrder == 'ASC' ? 1 : -1 }
        return sortObj
    }
    else {
        //else sort all transactions by latest created
        sortObj = { "_id": -1 }
        return sortObj
    }
};