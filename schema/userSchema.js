//requiring mongoose  
const { default: mongoose } = require("mongoose");
const transactionModel = require('../schema/transactions');


//creating option object for timestamp fields in collection
const option = {
    timestamps: true
}

//defining userSchema with options
const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: "user"
    },
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    fullName: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number
    },
    availableCoins: {
        type: Number,
        default: 0
    },
    referralUsers: {
        type: Number,
        default: 0
    },
    referLink: {
        type: String,
        default: null
    }
}, option);

//pre hook will be executed before save any user's details in users collection
userSchema.pre('save', async function (next) {
    //this function creates full name of user based on first name and last name
    const full_name = `${this.fname} ${this.lname}`;
    this.fullName = full_name;
    next();
});


//post hook will be executed after save any user's details in users collection
userSchema.post('save', async function (next) {
    //this function enter transaction of welcome bonus of user
    const transaction = await new transactionModel({
        'user_id': `${this._id}`,
        'balance': `${this.availableCoins}`,
        'amount': `${this.availableCoins}`
    });
    await transaction.save();
    next();
});




const UserModel = mongoose.model('users', userSchema);
module.exports = UserModel;