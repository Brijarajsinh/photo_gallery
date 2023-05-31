//requiring necessary packages
const express = require('express');
const router = express.Router();
const passport = require('passport');
const functionUsage = require('../helpers/function');

//requiring user schema for checking and entry of admin
const userModel = require('../schema/userSchema');

//post Route user/registration to store user details in users collection
router.post('/registration', async function (req, res, next) {
  try {
    const userDetails = req.body;
    const exist = await userModel.countDocuments({ email: userDetails.email, role: 'user' });
    if (exist) {
      const response = {
        type: "error",
        message: "E-mail is already registered by another user"
      }
      console.log("User is already Registered");
      res.send(response);
    }
    else {
      const user = await new userModel({
        "fname": userDetails.fname,
        "lname": userDetails.lname,
        "email": userDetails.email,
        "gender": userDetails.gender,
        "phone": userDetails.phone,
        "password": functionUsage.generatePasswordHash(userDetails.password),
        "referLink": await functionUsage.generateReferLink(6),
        "availableCoins": await functionUsage.welcomeBonus()
      });
      await user.save();
      //after store in database store details in browser's cache and redirect to dashboard page
      req.logIn(user, async function (err) {
        if (err) {
          return next(err);
        }
        //set the local variable 'user' to access details of current logged in user
        console.log("Log IN Successfully");
        res.locals.user = req.user;

        //if user register with referral code than 
        if (userDetails.referral) {
          const referral = await userModel.findOne({ "referLink": userDetails.referral }, { "_id": 1, "referralUsers": 1 });
          //checks if applied referral code is valid and limit of referring user is applicable

          if (referral.referralUsers <= await functionUsage.referralCount()) {

            //if user entered referral code is valid and limit of referring user is applicable
            // than that referred user will get extra referral bonus via applyReferBonus function
            
            await functionUsage.applyReferBonus(referral._id);

          }
        }
        res.send({
          type: 'success'
        });
      });
    }

  } catch (error) {
    console.log("Error Generated in user Registration process");
    console.log(error.toString());
    res.send({
      type: 'error'
    });
  }
});

//login post route to login process of user
router.post('/login', async function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err)
    }

    //if user entered details are not valid than flash error message on same page
    if (!user) {
      // *** Display message without using flash option
      // re-render the login form with a message
      req.flash('error', info.message);
      return res.redirect('/');
    }

    //if user entered credentials are valid than redirect to dashboard page
    req.logIn(user, async function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/dashboard');
    });
  })(req, res, next);
})
module.exports = router;