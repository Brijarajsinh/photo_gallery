
const userModel = require('../schema/userSchema');
const { storeTransaction } = require('./transaction.services');

//searchedDetails function returns searched criteria
exports.searchedDetails = async (search) => {
    const searchObj = {}
    if (search.from && search.to) {
        searchObj['from'] = search.from;
        searchObj['to'] = search.to;
    }
    if (search.charge) {
        //if user wants to search transaction by charge than searching is applied while fetching transactions records
        searchObj['searchCost'] = search.charge;
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

//deductUploadImageCharge service deduct image charge from user wallet and entry in transaction collection
exports.deductUploadImageCharge = async (userId, charge, name, imageCount, uploadCharge) => {
    await userModel.updateOne({
        "_id": userId
    },
        {
            $inc: {
                'availableCoins': -charge
            }
        });

    const description = `${charge} coins debited for uploading ${imageCount} image (Charge per Image Uploading - ${uploadCharge}) coins`
    //Store Entry In Transaction Model of charge deduction of image uploading
    await storeTransaction(userId,'debit',charge,'image-deduction',description);


    //using socket.io send notification to the admin that user uploaded an image
    io.to('adminRoom').emit('imageUpload', {
        'userName': name
    });
};