//requiring necessary packages
const express = require('express');
const router = express.Router();
const checkRole = require('../helpers/function');



//get Route to render dashboard page of the application after user registered successfully or user login successfully
router.get('/', checkRole.checkUser);

module.exports = router;