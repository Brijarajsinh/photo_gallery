//requiring necessary packages
const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin.controller');
const checkRole = require('../helpers/function');


//get Route to fetch current general-settings
router.get('/', checkRole.checkAdmin, adminController.getGeneralSettings);

//POST Route to update current-general settings
router.post('/', checkRole.checkAdmin, adminController.updateGeneralSettings);

module.exports = router;

