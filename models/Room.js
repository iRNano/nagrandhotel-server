const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RoomSchema = new Schema({
    name: {
        type: String,
        require: [true, "Room name is required"]
    },
    categoryId: { //room capacity
        type: String,
        required: [true, "Category Id is required"]
    },
    price: {
        type: Number,
        required: [true, "Price is required"]
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"]
    },
    images: {
        type: Array,
        required: [true, "images are required"]
    }
})

module.exports = mongoose.model("Room", RoomSchema)