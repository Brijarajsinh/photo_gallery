const functionUsage = require('../helpers/function');

//referralBonus function provides service to add referral bonus to referred by user
exports.applyReferBonus = async (user) => {
    await functionUsage.applyReferBonus(user);
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
        "password": functionUsage.generatePasswordHash(user.password),
        "referLink": await functionUsage.generateReferLink(6),
        "availableCoins": await functionUsage.getWelcomeBonus()
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
exports.createImgArray = async (imageCount,userId,images,cost) => {
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
    console.log(uploadImages);
    return uploadImages;
};

