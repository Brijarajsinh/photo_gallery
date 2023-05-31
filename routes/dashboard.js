//requiring necessary packages
const express = require('express');
const router = express.Router();


//get Route to render dashboard page of the application after user registered successfully or user login successfully
router.get('/',
    function (req, res, next) {
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        next()
    },
    function (req, res, next) {
        res.render('dashboard', {
            title: 'Dashboard'
        });
    });

module.exports = router;