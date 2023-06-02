//requiring necessary packages
const express = require('express');
const router = express.Router();
const commonController = require('../controller/users.controller');
const check = require('../helpers/auth');
/* GET home page. */

//Get Route to render login page with before login layout
router.get('/', commonController.loginPage);

//GET Route to Logout user and clearing user details from browser's cookies
router.get('/logout',commonController.logout);

//GET Route to check e-mail field's value is already registered or not
//this route is called using jquery validator method of remote
router.get('/check-email',check.commonMiddleware,commonController.checkEmail);

//sign-up route to render Registration page
router.get('/sign-up',commonController.signUp);

module.exports = router;
