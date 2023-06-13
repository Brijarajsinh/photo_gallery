//requiring necessary packages
const express = require('express');
const router = express.Router();
const { checkUser } = require('../helpers/function');
const multer = require('multer');
const { getGallery } = require('../controller/gallery.controller');
const { uploadImage } = require('../controller/gallery.controller');
const { getUploadImagePage } = require('../controller/gallery.controller');
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/gallery/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});
const image = multer({
    storage: imageStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/gif" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
            cb(null, true);
        } else {
            return cb(null, "Invalid file format");
        }
    }
});


//get Route to render dashboard page of the application after user registered successfully or user login successfully
router.get('/', checkUser, getGallery);

//get '/upload-image' Route to render image-upload page on click of upload image button
router.get('/upload-image', checkUser, getUploadImagePage);

//post Route to add records in image collection
router.post('/upload-image', checkUser, image.array('photos'), uploadImage);

module.exports = router;