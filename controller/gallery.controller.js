const commonFunction = require('../helpers/function');
const galleryModel = require('../schema/gallery');
const { createImgArray } = require('../services/user.services');
const galleryService = require('../services/gallery.services');
const moment = require('moment');
//getGallery function render gallery page to the user
exports.getGallery = async (req, res) => {
    try {
        const start = moment(Date.now()).subtract(7, 'd').format('yy-MM-DDTHH:mm');
        const end = moment(Date.now()).format('yy-MM-DDTHH:mm');
        const find = await galleryService.prepareFindObjImages(req.user._id, req.query);
        const search = await galleryService.prepareSearchObject(req.query);
        const sort = await commonFunction.prepareSortObj(req.query.sort, req.query.sortOrder);
        const pageSkip = (Number(req.query.page)) ? Number(req.query.page) : 1;
        const limit = 5;
        const skip = (pageSkip - 1) * limit;

        const images = await galleryModel.find(find).sort(sort).skip(skip).limit(limit).lean();
        //find total count of images
        const totalImages = await galleryModel.countDocuments(find);
        //generates pages by dividing total images displayed in one page
        const pageCount = Math.ceil(totalImages / limit);
        const page = await commonFunction.createPagination(pageCount);

        const response = {
            title: 'Gallery',
            images: images,
            page: page,
            currentPage: pageSkip,
            from: start,
            to: end
        }
        //if this route is called using ajax request than load data through partials
        if (req.xhr) {
            //render  user/gallery  to display uploaded post by user with blank layout
            response['layout'] = 'blank';
            response['search'] = search;
        }
        //otherwise load data through main layout
        //render  user/gallery  to display uploaded post by user
        res.render('user/gallery', response);
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

//uploadImage function store uploaded image in db 
exports.uploadImage = async (req, res) => {
    try {
        //count total requested image to be upload by client
        const imageCount = req.files.length;

        //fetch image uploading charge from general setting collection
        const uploadCharge = await commonFunction.getImageUploadCharge();

        //Fetch available coins in wallet of logged-in user
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
            const uploadImages = await createImgArray(imageCount, req.user._id, req.files, uploadCharge);
            //insert multiple documents in image collection if available balance is valid for uploading requested images
            await galleryModel.insertMany(uploadImages);
            //deduct the uploading charge from user's wallet by updating availableCoins
            await galleryService.deductUploadImageCharge(req.user._id, charge, req.user.fullName, imageCount, uploadCharge);

            //send response type="success"
            const response = {
                type: 'success'
            }
            res.send(response);
        }
    } catch (error) {
        console.log("Error Generated in uploading image");
        console.log(error);
        res.send({
            type: 'error',
            message: error.toString()
        });
    }
}