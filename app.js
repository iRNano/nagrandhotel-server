const express = require("express");
const dotenv = require("dotenv");
const app = express();
dotenv.config()
const PORT = process.env.PORT || 4000;
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
//Models
const Users = require("./models/User.js");
const Rooms = require("./models/Room");
const Categories = require("./models/Category");
const Bookings = require("./models/Booking");
const Tokens = require("./models/Token");
const { response } = require("express");

//connect to database

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    );
    
  } catch (error) {
    throw error    
  }
}

// mongoose
const db = mongoose.connection;

db.once("open", () => console.log("We are connected to MongoDB"));
db.on('disconnected', () => console.log("We are disconnected to MongoDB"))
db.on('connected', () => console.log("We are connected to MongoDB"))





//middlewares
app.use(cors({credentials: true, origin: true}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use("/users", require("./crud")(Users));
app.use("/rooms", require("./crud")(Rooms));
app.use("/categories", require("./crud")(Categories));
app.use("/book", require("./crud")(Bookings));
app.use("/token", require("./crud")(Tokens));

//error handler
app.use((err, req, res, next) => {
  const errStatus = err.status || 500
  const errMessage = err.message || "Something went wrong!"
  
  return res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMessage,
    stack: err.stack
  })
});


app.listen(PORT, ()=>{
  connect()
  console.log("Listening to port " + PORT)
});