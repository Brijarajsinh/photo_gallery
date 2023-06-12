//requiring necessary packages
const express = require('express');
const router = express.Router();
const checkUserRole = require('../controller/users.controller');

//get Route to render dashboard page of the application after user registered successfully or user login successfully
router.get('/', checkUserRole.redirectToDashboard);

module.exports = router;