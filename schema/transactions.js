//requiring mongoose and custom-env

const { default: mongoose } = require("mongoose");
require('custom-env').env();

//creating option object for timestamp fields in collection
const option = {
    timestamps: true
}

//defining transactionSchema with options
const transactionSchema = new mongoose.Schema({
    userId: {
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
    },
    description: {
        type: String,
        required: true
    }
}, option);

//creating model for above described schema
const transactionModel = mongoose.model('transactions', transactionSchema);

//exporting model
module.exports = transactionModel;