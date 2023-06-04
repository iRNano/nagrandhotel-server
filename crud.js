const express = require("express");
require("dotenv").config();
const multer = require("multer");
const fs = require("fs");
// const Auth = require("./auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
// const User = require("./models/User");
// const Booking = require("./models/Booking");
const stripe = require("stripe")("sk_test_0pXdiX31lAcpRutVhs6sCP7500CA7c9Fkq");
const Error = require("./utils/error");
const Auth = require("./utils/verifyToken");
const cloudinary = require("cloudinary")

cloudinary.config({ 
  cloud_name: 'dyoelhx3i', 
  api_key: '323436393889653', 
  api_secret: 'P_i8wThcWwEtGFJcUpPQ1oi4eFo' 
});


let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + "-" + file.originalname);
  },
});

let upload = multer({ storage: storage });

//nodemailer config
// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: process.env.EMAIL_USERNAME,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

console.log(process.env.EMAIL_USERNAME + " - " + process.env.EMAIL_PASSWORD);
module.exports = (Collection) => {
  //register
  const register = async (req, res, next) => {
    const newUser = req.body;
    //Username must be greater than 8 characters
    // console.log(newUser.username.length);
    if (newUser.username?.length < 8) return next(Error.createError(400,"Username must be greater than 8 characters" ))
      
    //Password must be greater than 8 characters
    if (newUser.password?.length < 8) return next(Error.createError(400,"Password must be greater than 8 characters" ))
    //Password2 must be greater than 8 characters
    if (newUser.password2?.length < 8) return next(Error.createError(400,"Password2 must be greater than 8 characters" ))
    //Passwords should match
    if (newUser.password2 !== newUser.password) return next(Error.createError(400,"Password does not match" ))
      

    Collection.findOne({ email: newUser.email }, (err, email) => {
      if (email) return next(Error.createError(400,"The email address you have entered is already associated with another account.'" ))

      bcrypt.hash(newUser.password, 10, (err, hashedPassword) => {
        newUser.password = hashedPassword;
        Collection.create(newUser, async (err, newUser) => {
          console.log('create',err)
          if (err) {
            return next(err)
          } else {
            return res.json({
              status: 200,
              message: "Registered Successfully",
            });
          }
        });
      });
    });

    //end of User.findOne

    //For email verification
    async function sendVerificationEmail(newUser, req, res, next) {
      try {
        let token = newUser.generateVerificationToken();
        // Save the verification token
        token.save();
        //nodemailer
        transporter.sendMail(
          {
            to: newUser.email,
            subject: "Please verify your email",
            html: `Please click this link to confirm your email address : <a href="http://localhost:3000/token/verify/${token.token}">Link</a>`,
          },
          (err, result) => {
            if (err) return next(err);
            return console.log(result);
          }
        );
      } catch (error) {
        console.log("fail?");
        res.status(500).json({ message: error.message });
      }
    }
  };

  //verify email function
  const verify = async (req, res, next) => {
    try {
      Collection.find({ token: req.params.token }, (err, result) => {
        let [tokenInfo] = result;
        let { userId, ...rest } = tokenInfo;

        if (err) {
          return console.log(err);
        }

        User.findOne({ _id: userId }, (err, user) => {
          if (err) return res.json({ status: 400, message: err.message });
          user.isVerified = true;
          user.save();
          return res.json({
            user,
            message: "Thank you for verifying your email!",
          });
        });
      });
    } catch (e) {
      res.send(e);
    }
  };
  //Login
  const login = (req, res, next) => {
    const email = req.body.email;
    Collection.findOne({ email }, (err, user) => {
      console.log(user)
      if (err || !user)
      return next(Error.createError(400,"No user found" ))
        // return res.status(400).json({
        //   status: 400,
        //   message: "No user found",
        // });
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        // console.log(req.body.password + " = " + user.password);
        // console.log(result);
        // console.log('login', err)
        if (!result) {
          return res.status(401).json({
            auth: false,
            status: 401,
            message: "Invalid Credentials",
            token: null,
          });
        } else {
          console.log('login', user)
          // user = user.toObject(); // created new object to be used for jwt
          // delete user.password; // deleted password property of the new object to exclude it from jwt
          let token = jwt.sign({id:user._id, isAdmin: user.isAdmin}, process.env.JWT, { expiresIn: "1h" });
          const {password, isAdmin, ...otherDetails} = user
          res.cookie("access_token", token, { httpOnly: true,}).status(200).json({ details: { ...otherDetails }, isAdmin });

        }
      });
    });
  };

  //Create
  const create = (req, res, next) => {
    const newEntry = req.body;
    console.log('create',newEntry)
    //check if req.file contains images
    if (req.files) {

      
cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
{ public_id: "olympic_flag" }, 
function(error, result) {console.log(result); });
      // newEntry.images = [];
      // req.files.map((file) => {
      //   let img = fs.readFileSync(file.path);

      //   let finalImg = {
      //     contentType: file.mimetype,
      //     path: "/images/" + file.filename,
      //   };
      //   newEntry.images.push(finalImg);
      // });
      // console.log(newEntry.images);
    } 
    // else {
    //   return res
    //     .status(400)
    //     .json({ status: 400, message: "error during uploading" });
    // }
    Collection.create(newEntry, (err, newEntry) => {
      console.log(err);
      if (err) {
        res.status(500).json({ status: 500, message: "GG sir" });
      } else {
        res.status(200).json({ newEntry, status: 200, message: "Successfull" });
      }
    });
  };

  //read many

  const readMany = (req, res, next) => {
    let query = {};
    Collection.find(query, (err, result) => {
      if (err) {
        res.status(500).send(err);
        console.log(err.message);
      } else {
        res.send(result);
      }
    });
  };

  //read one

  const readOne = (req, res, next) => {
    const { _id } = req.params;

    Collection.findById({ _id }, (err, result) => {
      if (err) {
        res.status(500).send(err);
        console.log(err.message);
      } else {
        if (req.query.quantity) {
          let newQuantity = result.quantity - req.query.quantity;
          result.quantity = newQuantity;
          result.save();
        }
        res.send(result);
      }
    });
  };

  //Update

  const update = (req, res, next) => {
    console.log("update");
    console.log(req);
    const changedEntry = { ...req.body };
    console.log(changedEntry);

    if (req.files) {
      changedEntry.images = [];
      req.files.map((file) => {
        let img = fs.readFileSync(file.path);
        console.log(img);
        let finalImg = {
          contentType: file.mimetype,
          path: "/images/" + file.filename,
        };
        changedEntry.images.push(finalImg);
      });
      console.log(changedEntry.images);
    } 
    
    Collection.findOneAndUpdate(
      { _id: req.params._id },
      changedEntry,
      { new: true },
      (err, result) => {
        console.log(err);
        if (err) {
          res.status(400).json({ status: 400, message: "Check your inputs" });
        } else {
          console.log(result);
          res
            .status(200)
            .json({ status: 200, message: "Update successful", result });
        }
      }
    );
    console.log("endofupdate");
  };

  //delete

  const remove = (req, res, next) => {
    Collection.findOneAndDelete({ _id: req.params._id }, (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).json({ status: 200, message: "Delete successfull" });
      }
    });
  };
  //payment
  const payment = (req, res, next) => {
    // Collection.create()
    let booking = new Booking();
    booking._id;
    booking.email = req.body.token.email;
    booking.createdAt = req.body.token.created;
    booking.rooms = req.body.cartItems;
    booking.total = req.body.total;
    booking.paymentMode = req.body.token.type;

    let body = {
      source: req.body.token.id,
      amount: req.body.total,
      currency: "PHP",
    };

    //add charge to stripe account
    stripe.charges.create(body, (err, result) => {
      console.log(body);
      if (result) {
        console.log(result + "result");
        booking.save();
        return res
          .status(200)
          .json({ status: 200, message: "Transaction successful", booking });
      } else {
        return res
          .status(400)
          .json({ status: 400, message: "Transaction failed", err });
      }
    });
  };
  //routes

  let router = express.Router();

  router.get("/", readMany);
  router.get("/verify/:token", verify);
  router.get("/:_id", readOne);
  router.post("/", upload.array("images", 5), create);
  router.post("/login", login);
  router.post("/register", register);
  router.post("/stripe", payment);
  router.put("/:_id", Auth.verifyAdmin, upload.array("images", 5), update);
  router.delete("/:_id", Auth.verifyAdmin, remove);

  return router;
};
