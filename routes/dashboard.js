//requiring necessary packages
const express = require('express');
const router = express.Router();
const { redirectToDashboard, checkAdmin } = require('../helpers/function');
const { prepareUserStatistics } = require('../controller/admin.controller');

//get Route to render dashboard page of the application after user registered successfully or user login successfully
router.get('/', redirectToDashboard);

router.get('/admin/user-statistics', checkAdmin, prepareUserStatistics)
module.exports = router;