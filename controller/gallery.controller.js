const commonFunction = require('../helpers/function');
const galleryModel = require('../schema/uploadedImages');
const userModel = require('../schema/userSchema');
const transactionModel = require('../schema/transactions');
const moment = require('moment');


//getGallery function render gallery page to the client
exports.getGallery = async (req, res) => {
    try {
        const search = {};
        const sort = {};
        const find = {
            "userId": req.user._id
        };

        if (req.query.from && req.query.to) {
            const start = new Date(req.query.from);
            const end = new Date(req.query.to);
            find.createdAt = {
                "$gte": start,
                "$lt": end
            }
            search['from'] = req.query.from;
            search['to'] = req.query.to;
        }
        const pageSkip = (Number(req.query.page)) ? Number(req.query.page) : 1;
        const limit = 2;
        const skip = (pageSkip - 1) * limit;
        if (req.query.sort) {
            sort[req.query.sort] = req.query.sortOrder == 'ASC' ? 1 : -1
        }
        else {
            sort._id = -1;
        }
        if (req.query.charge) {
            //if user wants to search transaction by charge than searching is applied while fetching transactions records
            find['charge'] = req.query.charge;
            search['searchCost'] = req.query.charge;
        }

        const images = await galleryModel.find(find).sort(sort).skip(skip).limit(limit).lean();
        //find total count of users
        const totalImages = await galleryModel.countDocuments(find);
        //generates pages by dividing total images displayed in one page
        const pageCount = Math.ceil(totalImages / limit);
        const page = [];
        for (let i = 1; i <= pageCount; i++) {
            page.push(i);
        }
        //if this route is called using ajax request than load data through partials
        if (req.xhr) {
            //render  user/gallery  to display uploaded post by user with blank layout
            res.render('user/gallery', {
                title: 'Gallery',
                images: images,
                page: page,
                layout: 'blank',
                currentPage: pageSkip,
                search: search
            });
        }
        //otherwise load data through rendering gallery page
        else {
            //render  user/gallery  to display uploaded post by user
            res.render('user/gallery', {
                title: 'Gallery',
                images: images,
                page: page,
                currentPage: pageSkip
            });
        }
    } catch (error) {
        console.log("Error Generated While rendering gallery page");
        console.log(error);
        res.send({
            type: 'error'
        });
    }
}

//getUploadImagePage function render photo uploading page
//from where user can upload single and multiple images
exports.getUploadImagePage = async (req, res) => {
    try {
        res.render('user/upload', {
            title: 'Upload Image'
        });
    } catch (error) {
        console.log("Error generated While rendering upload-image page to user");
        console.log(error.toString());
        res.send({
            type: 'error',
            message: error.toString()
        });
    }
}

//uploadImageController function store uploaded image in db 
exports.uploadImageController = async (req, res) => {
    try {
        //count total requested image to be upload by client
        const imageCount = req.files.length;

        //fetch image uploading charge from general setting collection
        const uploadCharge = await commonFunction.getImageUploadCharge();

        //Fetch 
        const availableCoins = req.user.availableCoins;
        const charge = imageCount * uploadCharge;

        //if uploading charge will be grater than available coins
        //than simply returns response with error type and message like "Insufficient coins"
        if (charge > availableCoins) {
            res.send({
                type: 'error',
                message: 'Insufficient Coins To Upload'
            })
        }
        //else upload multiple image in single mongoose query
        else {
            const uploadImages = [];
            for (let i = 0; i < imageCount; i++) {
                const imageDetails = {
                    "userId": req.user._id,
                    "image": req.files[i].filename,
                    "originalName": req.files[i].originalname,
                    "charge": uploadCharge
                };
                uploadImages.push(imageDetails);
            }

            //insert multiple documents in image collection if available balance is valid for uploading requested images
            await galleryModel.insertMany(uploadImages);

            //deduct the uploading charge from user's wallet by updating availableCoins
            await userModel.updateOne({
                "_id": req.user._id
            },
                {
                    $set: {
                        "availableCoins": availableCoins - charge
                    }
                });

            //Store Entry In Transaction Model of charge deduction of image uploading
            const transaction = await new transactionModel({
                'userId': req.user._id,
                'status': 'debit',
                'amount': charge,
                'type': `image-deduction`,
                'description': `${charge} coins debited for uploading ${imageCount} image (Charge per Image Uploading - ${uploadCharge})`
            });
            await transaction.save();

            //send response type="success"
            const response = {
                type: 'success'
            }
            res.send(response);
        }
    } catch (error) {
        console.log("Error Generated in uploading image");
        console.log(error.toString());
        res.send({
            type: 'error',
            message: error.toString()
        });
    }
}