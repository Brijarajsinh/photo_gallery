const userModel = require('../schema/userSchema');
const functionUsage = require('../helpers/function');
const passport = require('passport');
const referralBonusService = require('../services/user.services');
const transactionModel = require('../schema/transactions');
exports.registration = async (req, res, next) => {
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
                        // than that referred user will get extra referral bonus via referBonus service
                        await referralBonusService.referralBonus(referral._id);
                        const transactionDetails = await transactionModel.findOne({ "referLink": user.referLink });
                        console.log("TRANSACTIONS:____------> ");
                        console.log(transactionDetails);
                        // const transaction = await new transactionModel({
                        //     'user_id': `${_id}`,
                        //     'balance': `${this.availableCoins}`,
                        //     'amount': `${this.availableCoins}`
                        // });
                        // await transaction.save();
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
}

//login controller controls login process of user
exports.login = async (req, res) => {
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
    })(req, res);
}

//signUp controller render sign-up page to the user
exports.signUp = async (req, res) => {
    await _isLoggedIn(req, res);
    res.render('sign-up', { title: 'Registration Page', layout: 'beforeLogin' })
}

//loginPage Controller render login page to the user
exports.loginPage = async (req, res) => {
    await _isLoggedIn(req, res);
    res.render('login', { title: 'Login Page', layout: 'beforeLogin' });
}

//log-out controller to control logout process of user
exports.logout = async (req, res) => {
    req.logOut();
    req.session = null;
    res.redirect("/");
}

//checkEmail controller checks e-mail for restricting registration with duplicate e-mail
exports.checkEmail = async (req, res) => {
    const condition = {
        email: req.query.email
    }
    const exist = await userModel.countDocuments(condition);
    //if e-mail is already registered by other user than return false
    if (exist) return res.send(false);

    //else return true
    return res.send(true);
}

//this function checks role of logged in user and according to role allow functionalities
exports.redirectToDashboard = async (req, res) => {
    if (req.user.role == 'admin') {
        res.render('dashboard', {
            title: 'Dashboard'
        });
    }
    else {
        res.render('landing', {
            title: 'Dashboard'
        });
    }
};

function _isLoggedIn(req, res, next) {
    if (req.user) {
        return res.redirect('/dashboard');
    }
}