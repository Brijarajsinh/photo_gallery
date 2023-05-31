//requiring mongoose and custom-env

const { default: mongoose } = require("mongoose");
require('custom-env').env();

//creating option object for timestamp fields in collection
const option = {
    timestamps: true
}

//defining settingSchema with options
const settingSchema = new mongoose.Schema({
    welcomeBonus: {
        type: Number,
        required:true,
        default:process.env.welcomeBonus
    },
    referralBonus: {
        type: Number,
        required:true,
        default:process.env.referralBonus
    },
    chargePerImage: {
        type: Number,
        required:true,
        default:process.env.chargePerImage
    },
    maxRefer: {
        type: Number,
        required:true,
        default:process.env.maxRefer
    },
}, option);
const settingModel = mongoose.model('generalSettings', settingSchema);
module.exports = settingModel;