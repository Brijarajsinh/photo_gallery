//requiring mongoose model and other variables to work with collection of that models
const userModel = require('../schema/userSchema');
const path = require('path');
const functionUsage = require('../helpers/function');
const { updatedDetails } = require('../services/user.services');
//Fetches the current logged-in user's details from the users collection
exports.getProfileDetails = async (req, res) => {
    try {
        const currentDetails = await userModel.findOne({
            "_id": req.user._id
        }, {
            "fname": 1,
            "lname": 1,
            "gender": 1,
            "phone": 1,
            "profile": 1,
            "email": 1
        }).lean();
        res.render('viewProfile', {
            title: 'My Account',
            currentDetails: currentDetails
        });
    } catch (error) {
        console.log("Error Generated While Current-Logged in user views own profile");
        console.log(error);
        res.send({
            type: 'error',
            message: error.toString()
        });
    }
};

//edit the requested updating-details of the current logged in user in user's collection
exports.editProfileDetails = async (req, res) => {
    try {
        //preparing updatedUser object to set the updated details in update query
        const updatedUser = await updatedDetails(req.body);

        //if logged-in user add or edit's profile picture than add that requested file in update obj
        if (req.file) updatedUser['profile'] = path.basename(req.file.path);

        //update query of mongoose
        await userModel.updateOne({
            "_id": req.user._id
        }, updatedUser);
        res.send({
            type: 'success'
        });

    } catch (error) {
        //if error generated in user profile update process than this catch block will be executed
        console.log("Error Generated While user Updates Profile");
        console.log(error);
        res.send({
            type: 'error',
            message: error.toString()
        });
    }
};

//changes the password of logged-in user
exports.changePassword = async (req, res) => {
    try {
        const newPassword = await functionUsage.generatePasswordHash(req.body.newPassword);
        const currentPassword = await userModel.findOne({
            "_id": req.user._id
        }, {
            "_id": 1,
            "password": 1
        });
        //if user enters wrong current password than throw error with message
        if (currentPassword.password != await functionUsage.generatePasswordHash(req.body.currentPassword)) {
            throw "Current Password Not Matched"
        }
        //if user try to set new password same as old password than throw error from here
        else if (currentPassword.password == newPassword) {
            throw "You Can't set new password same to old password."
        }
        //else update the new password in users collection
        else {
            await userModel.updateOne({
                "_id": req.user._id
            }, {
                "password": newPassword
            });
            res.send({
                type: 'success'
            });
        }
    } catch (error) {
        //If Error Generated While User Change password Process Than This Catch Block Will Executed
        console.log("Error Generated While User Change password");
        console.log(error);
        res.send({
            type: 'error',
            message: error.toString()
        });
    }
};