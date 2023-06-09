//requiring mongoose and custom-env
const { default: mongoose } = require("mongoose");
require('custom-env').env();

//creating option object for timestamp fields in collection
const option = {
    collection: 'general-settings',
    timestamps: {
        createdAt:'createdOn',
        updatedAt:'updatedOn'
    }
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

//creating model for above described schema
const settingModel = mongoose.model('general-settings', settingSchema);

//exporting model
module.exports = settingModel;