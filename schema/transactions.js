//requiring mongoose and custom-env

const { default: mongoose } = require("mongoose");
require('custom-env').env();

//creating option object for timestamp fields in collection
const option = {
    timestamps: true
}

//defining settingSchema with options
const transactionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        enum: ['credit', 'debit'],
        default: 'debit'
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['welcome-bonus', 'referral-bonus', 'image-deduction'],
        default: 'image-deduction'

    }
}, option);
const transactionModel = mongoose.model('transactions', transactionSchema);
module.exports = transactionModel;