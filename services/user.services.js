const commonFunction = require('../helpers/function');
const UserModel = require('../schema/userSchema');
const { storeTransaction } = require('./transaction.services');

//applyReferBonus function applies referral bonus to the applicable user
exports.applyReferBonus = async (user) => {
    const _this = this;
    const referralBonus = await commonFunction._getReferralBonus()
    await UserModel.updateOne({
        "_id": user
    },
        {
            $inc: {
                "availableCoins": referralBonus,
                "referralUsers": 1
            }
        });
    //Store Entry In Transaction Model To Track User's Wallet Transactions
    const description = `${referralBonus} coins are credited for referring user`
    await storeTransaction(user, 'credit', referralBonus, 'referral-bonus', description);

    //using socket.io send notification to the user that another user register with his referral link
    io.to("userRoom").emit('registerWithReferLink', {
        'userName': `${user.fname} ${user.lname}`,
        'referredBy': `${user}`
    });
};

//this function creates and returns user object to store in user's collection
exports.createUserRegistrationObject = async (user) => {
    const userObj =
    {
        "fname": user.fname,
        "lname": user.lname,
        "email": user.email,
        "gender": user.gender,
        "phone": user.phone,
        "password": commonFunction.generatePasswordHash(user.password),
        "referLink": await commonFunction.generateReferLink(6),
        "availableCoins": await commonFunction.getWelcomeBonus()
    }
    return userObj;
};

//this function returns object of to be updated user's details
exports.updatedDetails = async (user) => {
    const detailsObj = {
        'fname': user.fname,
        'lname': user.lname,
        'email': user.email,
        'gender': user.gender,
        'phone': user.phone,
        'fullName': `${user.fname} ${user.lname}`
    }
    return detailsObj;
};

//this function creates and returns an array of image to be uploaded
exports.createImgArray = async (imageCount, userId, images, cost) => {
    const uploadImages = [];
    for (let i = 0; i < imageCount; i++) {
        const imageDetails = {
            "userId": userId,
            "image": images[i].filename,
            "originalName": images[i].originalname,
            "charge": cost
        };
        uploadImages.push(imageDetails);
    }
    return uploadImages;
};

//getCurrentPassword function fetches the current password of logged-in user from users collection
exports.getCurrentPassword = async (userId) => {
    const currentPassword = await UserModel.findOne(
        {
            "_id": userId
        },
        {
            "_id": 0,
            "password": 1
        });
    return currentPassword.password;
};