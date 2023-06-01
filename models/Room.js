const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RoomSchema = new Schema({
    name: {
        type: String,
        require: [true, "Room name is required"]
    },
    price: {
        type: Number,
        required: [true, "Price is required"]
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },
    maxNumber: {
        type: Number,
        required: true
    },
    roomNumbers: [{ number: Number, unavailableDates: {type: [Date]}}],
    images: {
        type: Array,
        required: [true, "images are required"]
    }
},
{ timestamps: true })

module.exports = mongoose.model("Room", RoomSchema)