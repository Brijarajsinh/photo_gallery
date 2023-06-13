//requiring mongoose and custom-env

const { default: mongoose } = require("mongoose");
require('custom-env').env();

//creating option object for timestamp fields in collection
const option = {
    collection: 'withdraw',
    timestamps: {
        createdAt:'createdOn',
        updatedAt:'updatedOn'
    }
}

//defining withdrawSchema with options
const withdrawSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved','rejected'],
        default: 'pending'
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String
    }
}, option);

//creating model for above described schema
const withdrawModel = mongoose.model('withdraw', withdrawSchema);

//exporting model
module.exports = withdrawModel;