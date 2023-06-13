const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const profileController = require('../controller/account.controller');
const { getAvailableCoins } = require('../helpers/function');
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
router.get('/', profileController.getProfileDetails);

//put route to edit user details in users collection
router.put('/edit-profile', image.single('profile'), profileController.editProfileDetails);

//put route to edit user's password  in users collection
router.put('/change-password', profileController.changePassword);

router.get('/get-coins', async function (req, res, next) {
    const availableCoins = await getAvailableCoins(req.user._id);
    //if e-mail is already registered by other user than return false
    if (availableCoins < req.query.withdraw) return res.send(false);

    //else return true
    return res.send(true);
});

module.exports = router;



