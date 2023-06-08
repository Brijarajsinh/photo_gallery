//requiring mongoose
const { default: mongoose } = require("mongoose");

//creating option object for timestamp fields in collection
const option = {
    timestamps: true
}

//defining uploadedImages with options
const uploadedImages = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    charge: {
        type: Number,
        required: true,
    },
}, option);

//creating model for above described schema
const imageModel = mongoose.model('uploadedImages', uploadedImages);

//exporting model
module.exports = imageModel;