//searchedDetails function returns searched criteria
exports.searchedDetails = async (search) => {
    const searchObj = {}
    if (search.from && search.to) {
        search['from'] = search.from;
        search['to'] = search.to;
    }
    if (search.charge) {
        //if user wants to search transaction by charge than searching is applied while fetching transactions records
        search['searchCost'] = search.charge;
    }
    return searchObj;
};

//findObjImages function returns find object which is passed in find query of mongoose
exports.findObjImages = async (userId, search) => {

    const find = {
        "userId": userId
    };
    if (search.from && search.to) {
        const start = new Date(search.from);
        const end = new Date(search.to);
        find.createdOn = {
            "$gte": start,
            "$lt": end
        }
    }
    if (search.charge) {
        //if user wants to search images by charge than searching is applied while fetching images
        find['charge'] = search.charge;
    }
    return find;
};

exports.sortObj = async (sort, sortOrder) => {
    const sortObj = {};
    if (sort) {
        sortObj[sort] = sortOrder == 'ASC' ? 1 : -1
    }
    else {
        sortObj._id = -1;
    }
    return sortObj;
};