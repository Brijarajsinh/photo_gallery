//requiring necessary packages
const express = require('express');
const router = express.Router();
const userController = require('../controller/users.controller');
/* GET home page. */

//Get Route to render login page with before login layout
router.get('/', userController.loginPage);

//GET Route to Logout user and clearing user details from browser's cookies
router.get('/logout', userController.logout);

//GET Route to check e-mail field's value is already registered or not
//this route is called using jquery validator method of remote
router.get('/check-email', userController.checkEmail);

//sign-up route to render Registration page
router.get('/sign-up', userController.signUp);

//post Route /registration to store user details in users collection
router.post('/registration', userController.registration);

//login post route to login process of user
router.post('/login', userController.login);

module.exports = router;
