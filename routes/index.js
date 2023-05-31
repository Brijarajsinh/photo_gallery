//requiring necessary packages
const express = require('express');
const router = express.Router();

//requiring userModel to perform operations with user collection
const userModel = require('../schema/userSchema');
/* GET home page. */

//Get Route to render login page with before login layout
router.get('/',
  function (req, res, next) {
    res.render('login', { title: 'Login Page', layout: 'beforeLogin' });
  });

//GET Route to Logout user and clearing user details from browser's cookies
router.get('/logout', async function (req, res, next) {
  req.logOut();
  req.session = null;
  res.redirect("/");
});

//GET Route to check e-mail field's value is already registered or not
router.get('/check-email', async function (req, res, next) {
  //this route is called using jquery validator method of remote
  const condition = {
    email: req.query.email
  }
  const exist = await userModel.countDocuments(condition);
  //if e-mail is already registered by other user than return false
  if (exist) return res.send(false);

  //else return true
  return res.send(true);
});

//sign-up route to render Registration page
router.get('/sign-up', function (req, res, next) {
  res.render('sign-up', { title: 'Registration Page', layout: 'beforeLogin' });
});

module.exports = router;
