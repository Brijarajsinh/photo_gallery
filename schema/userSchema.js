//requiring mongoose  
const { default: mongoose } = require("mongoose");

//requiring storeTransaction function which provide service to store in transaction in transaction schema
const { storeTransaction } = require('../services/transaction.services');

//creating option object for timestamp fields in collection
const option = {
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'updatedOn'
    }
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
    },
    profile: {
        type: String
    }
}, option);

//pre hook will be executed before save any user's details in users collection

userSchema.pre('save', async function (next) {
    //this function creates full name of user based on first name and last name
    const full_name = `${this.fname} ${this.lname}`;
    //and stores the combination of first name and last name as full name in fullName field
    this.fullName = full_name;

    if (`${this.role}` == 'user') {
        //if registered user's role is 'use' 
        //then entry transaction of welcome bonus in transaction collection
        const description = `${this.availableCoins} coins are credited for registering in application`
        await storeTransaction(`${this._id}`,'credit',`${this.availableCoins}`,`welcome-bonus`,description);
    }
    next();
});

//creating model for above described schema
const UserModel = mongoose.model('users', userSchema);

//exporting model
module.exports = UserModel;