//requiring necessary packages
const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin.controller');
const { checkAdmin } = require('../helpers/function');


//get Route to fetch current general-settings
router.get('/', checkAdmin, adminController.getGeneralSettings);

//POST Route to update current-general settings
router.post('/', checkAdmin, adminController.updateGeneralSettings);

module.exports = router;

