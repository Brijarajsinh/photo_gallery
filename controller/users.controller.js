const userModel = require('../schema/userSchema');
const transactionModel = require('../schema/transactions');

const functionUsage = require('../helpers/function');
const passport = require('passport');
const referralBonusService = require('../services/user.services');
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
            //else Creates a new user object that will be stored in users collection
            const user = await new userModel({
                "fname": userDetails.fname,
                "lname": userDetails.lname,
                "email": userDetails.email,
                "gender": userDetails.gender,
                "phone": userDetails.phone,
                "password": functionUsage.generatePasswordHash(userDetails.password),
                "referLink": await functionUsage.generateReferLink(6),
                "availableCoins": await functionUsage.getWelcomeBonus()
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
                    if (referral.referralUsers <= await functionUsage.getReferralCount()) {
                        //if user entered referral code is valid and limit of referring user is applicable
                        // than that referred user will get extra referral bonus via referBonus service
                        await referralBonusService.applyReferBonus(referral._id);
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
        res.render('admin', {
            title: 'Dashboard'
        });
    }
    else {
        res.render('user', {
            title: 'Dashboard'
        });
    }
};

//getTransactions function gets all transactions of logged-in user
exports.getTransactions = async (req, res, next) => {
    try {
        const find = {
            "user_id": req.user._id
        };
        const sort = {};

        //if user wants to move to specific page than that page count which is passed in query parameter
        //using skip and limit achieve that page's data
        const pageSkip = (Number(req.query.page)) ? Number(req.query.page) : 1;
        const limit = 3;
        const skip = (pageSkip - 1) * limit;
        const search = {}

        if (req.query.sort) {
            //if user wants to sort transaction by field than add sort in mongoose query and sort results by that field
            sort[req.query.sort] = req.query.sortOrder == 'ASC' ? 1 : -1
        }
        else {
            //else sort all transactions by latest created
            sort._id = -1
        }
        if (req.query.amount) {
            //if user wants to search transaction by amount than searching is applied while fetching transactions records
            find['amount'] = req.query.amount;
            search['searchAmount'] = req.query.amount;
        }
        if (req.query.txtType && req.query.txtType != 'all') {
            //if user filters transactions by type(welcome-bonus,referral-bonus,image-deduction)
            //than only that type of records are fetched from database
            find['type'] = req.query.txtType;
            search['filterType'] = req.query.txtType;
        }
        if (req.query.status && req.query.status != 'all') {

            //if user filters transactions by action(credit,debit)
            //than only that type of records are fetched from database
            find['status'] = req.query.status;
            search['filterStatus'] = req.query.status;
        }
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
        const page = [];
        for (let i = 1; i <= pageCount; i++) {
            page.push(i);
        }

        //if this route is called using ajax request than load transactions through partials
        if (req.xhr) {
            res.render('user/transaction', {
                title: 'Transactions',
                layout: 'blank',
                page: page,
                search: search,
                transactions: transactions,
                currentPage:pageSkip
            });
        }
        //otherwise load data through rendering transaction page
        else {
            res.render('user/transaction', {
                title: 'Transactions',
                page: page,
                transactions: transactions,
                currentPage:pageSkip
            });
        }
    } catch (error) {
        console.log("Error Generated While User access Transaction Page");
        console.log(error);
    }
}

function _isLoggedIn(req, res, next) {
    if (req.user) {
        return res.redirect('/dashboard');
    }
}