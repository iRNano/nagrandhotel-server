const express = require('express')
const app = express()
const PORT = process.env.PORT || 4000
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
//Models
const Users = require('./models/User.js')
const Rooms = require('./models/Room')
const Categories = require('./models/Category')
const Bookings = require('./models/Booking')
const Tokens = require('./models/Token')

//connect to database
mongoose.connect("mongodb+srv://adrian:Nanopogi1@capstone3-67oz6.mongodb.net/cp3?retryWrites=true&w=majority",{
// mongoose.connect("mongodb://localhost/booking-system", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const db = mongoose.connection

db.once('open', () => console.log("We are connected to MongoDB"))

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json())
app.use(express.static('public'))
//routes

app.use('/users', require('./crud')(Users))
app.use('/rooms', require('./crud')(Rooms))
app.use('/categories', require('./crud')(Categories))
app.use('/book', require('./crud')(Bookings))
app.use('/token', require('./crud')(Tokens))

//check the invalid field on the error
app.use(function (err, req, res, next) {
    console.log('This is the invalid field ->', err.field)
    next(err)
})
//listen to database
app.listen(PORT, console.log('Listening to port '+PORT))