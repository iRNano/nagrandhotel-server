const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BookingSchema = new Schema({
    userId: {
        type: String,
    },
    email:{
        type: String,
        required: true
    },
    statusId: {
        type: String,
        default: "5e93c976d9ce7ffa0a39ce87"

    },
    dateCreated: {
        type: Date,
        default: Date.now()
    },
    paymentMode: {
        type: String,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    rooms:[
        {
            roomId: String,
            roomName: String,
            price: Number,
            checkin: Date,
            checkout: Date,
            quantity: Number,
            rooms: Array,
            subtotal: Number
        }
    ]
})

module.exports = mongoose.model("Booking", BookingSchema)