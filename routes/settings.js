//requiring necessary packages
const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin.controller');

//get Route to fetch current general-settings
router.get('/', adminController.getGeneralSettings);


//POST Route to update current-general settings
router.post('/', adminController.updateGeneralSettings);

module.exports = router;

