//requiring necessary packages
const express = require('express');
const router = express.Router();
const checkRole = require('../helpers/function');
const galleryController = require('../controller/gallery.controller');
const multer = require('multer');
const path = require('path');

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/gallery/')
    },
    filename: function (req, file, cb) {
        console.log("file => ", file);
        cb(null, file.originalname + Date.now() + path.extname(file.originalname));
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
router.get('/', checkRole.checkUser, galleryController.getGallery);

router.get('/upload-image', checkRole.checkUser, async function (req, res, next) {

    try {
        console.log("Route Called to upload-image client-side");
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

});

router.post('/upload-image', checkRole.checkUser, image.array('photos'), async function (req, res, next) {
    try {
        console.log("Route Called to upload-image server side");
        console.log(req.body);
        console.log(req.files);
        const response = {
            type: 'success'
        }
        res.send(response);
    } catch (error) {
        console.log("Error Generated in uploading image");
        console.log(error.toString());
        res.send({
            type: 'error',
            message: error.toString()
        });
    }
});

module.exports = router;