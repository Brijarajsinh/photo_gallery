//requiring model to work with collection of that models
const userModel = require('../schema/userSchema');
const transactionModel = require('../schema/transactions');

const functionUsage = require('../helpers/function');
const passport = require('passport');
const userServices = require('../services/user.services');
const transactionServices = require('../services/transaction.services');

//registration Controller to register user's details in users collection
exports.registration = async (req, res, next) => {
    try {
        const userDetails = req.body;
        const exist = await userModel.countDocuments({ email: userDetails.email, role: 'user' });
        if (exist) {
            //if user is already registered with this e-mail
            //send response with type error and message "E-mail is already registered"
            const response = {
                type: "error",
                message: "E-mail is already registered by another user"
            }
            console.log("User is already Registered");
            res.send(response);
        }
        else {
            //else Creates a new user object using user-service that will be stored in users collection
            const user = new userModel(await userServices.createUserRegistrationObject(userDetails));
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
                    if (referral.referralUsers <= await functionUsage.getReferralCount()) {
                        //if user entered referral code is valid and limit of referring user is applicable
                        // than that referred user will get extra referral bonus via referBonus service
                        await userServices.applyReferBonus(referral._id);
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
    res.render('sign-up', { title: 'Registration Page', layout: 'before-login', referral: req.query.referral })
}

//loginPage Controller render login page to the user
exports.loginPage = async (req, res) => {
    await _isLoggedIn(req, res);
    res.render('login', { title: 'Login Page', layout: 'before-login' });
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
    //if this route is called after login than checks unique email excluding current logged-in user's email
    if (req.user) {
        condition["_id"] = {
            $ne: req.user._id
        }
    }
    const exist = await userModel.countDocuments(condition);
    //if e-mail is already registered by other user than return false
    if (exist) return res.send(false);

    //else return true
    return res.send(true);
}


//getTransactions function gets all transactions of logged-in user
exports.getTransactions = async (req, res, next) => {
    try {

        //if user wants to move to specific page than that page count which is passed in query parameter
        //using skip and limit achieve that page's data
        const pageSkip = (Number(req.query.page)) ? Number(req.query.page) : 1;
        const limit = 3;
        const skip = (pageSkip - 1) * limit;
        const find = await transactionServices.findObjTransaction(req.user._id, req.query);
        const search = await transactionServices.searchedDetails(req.query);
        const sort = await functionUsage.prepareSortObj(req.query.sort, req.query.sortOrder);

        const transactions = await transactionModel.find(
            find
            , {
                "_id": 0,
                "status": 1,
                "amount": 1,
                "type": 1
            }).sort(sort).skip(skip).limit(limit).lean();

        //find total count of users
        const totalEntry = await transactionModel.countDocuments(
            find
        );
        //generates pages by dividing total users displayed in one page
        const pageCount = Math.ceil(totalEntry / limit);
        const page = await functionUsage.createPagination(pageCount);
        
        const response = {
            title: 'Transactions',
            page: page,
            transactions: transactions,
            currentPage: pageSkip
        }

        //if this route is called using ajax request than load transactions through blank layout
        if (req.xhr) {
            response['layout'] = 'blank';
            response['search'] = search;
        }
        //otherwise load data through main layout
        res.render('user/transaction', response);
    } catch (error) {
        console.log("Error Generated While User access Transaction Page");
        console.log(error);
    }
}

//if logged-in user try to access sign-up or login page than
function _isLoggedIn(req, res, next) {
    if (req.user) {
        //redirect to dashboard page
        return res.redirect('/dashboard');
    }
}