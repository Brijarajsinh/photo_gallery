//requiring necessary packages
const express = require('express');
const router = express.Router();
const checkRole = require('../helpers/function');
const transactionModel = require('../schema/transactions');
const mongoose = require('mongoose');


//get Route to render dashboard page of the application after user registered successfully or user login successfully
router.get('/', checkRole.checkUser, async function (req, res, next) {

    try {
        const find = {
            "user_id": req.user._id
        };
        const sort = {};
        const pageSkip = (Number(req.query.page)) ? Number(req.query.page) : 1;
        const limit = 10;
        const skip = (pageSkip - 1) * limit;

        if (req.query.sort) {
            sort[req.query.sort] = req.query.sortOrder == 'ASC' ? 1 : -1
        }
        else {
            sort._id = 1
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
        
        console.log("TRANSACTIONS TRANSACTIONS");
        console.log(transactions);

        console.log("PAGES PAGES");
        console.log(page);

        //if this route is called using ajax request than load transactions through partials
        if (req.xhr) {

            res.render('user/transaction', {
                title: 'Transactions',
                layout: 'blank',
                page: page,
                transactions: transactions
            });
        }
        //otherwise load data through rendering transaction page
        else {
            res.render('user/transaction', {
                title: 'Transactions',
                page: page,
                transactions: transactions
            });
        }
    } catch (error) {
        console.log("Error Generated While Admin access userList Page");
        console.log(error);
    }
});

module.exports = router;