//requiring necessary packages
const express = require('express');
const router = express.Router();
const userController = require('../controller/users.controller');

//post Route user/registration to store user details in users collection
router.post('/registration',userController.registration);

//login post route to login process of user
router.post('/login',userController.login);

module.exports = router;
