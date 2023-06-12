const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const commonController = require('../controller/account.controller');

//specifies storage location to store uploaded profile picture
const imageStorage = multer.diskStorage({
    destination: 'public/uploads/profile',
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

//declaring multer
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

//Get Route to render my-account page with before
router.get('/', commonController.getProfileDetails);

//put route to edit user details in users collection
router.put('/edit-profile', image.single('profile'), commonController.editProfileDetails);

//put route to edit user's password  in users collection
router.put('/change-password',commonController.changePassword);

module.exports = router;



