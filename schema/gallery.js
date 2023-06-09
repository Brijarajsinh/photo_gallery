//requiring mongoose
const { default: mongoose } = require("mongoose");

//creating option object for timestamp fields in collection
const option = {
    collection: 'gallery',
    timestamps: {
        createdAt:'createdOn',
        updatedAt:'updatedOn'
    }
}

//defining gallery with options
const gallerySchema = new mongoose.Schema({
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
const imageModel = mongoose.model('gallery', gallerySchema);

//exporting model
module.exports = imageModel;