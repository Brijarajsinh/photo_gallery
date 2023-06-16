//requiring necessary packages
const express = require('express');
const router = express.Router();
const { redirectToDashboard } = require('../helpers/function');

//get Route to render dashboard page of the application after user registered successfully or user login successfully
router.get('/', redirectToDashboard);

module.exports = router;