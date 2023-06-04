const jwt = require("jsonwebtoken")
// const User = require("./models/User")
const Error = require("./utils/error")

exports.isAdmin = (req, res, next) => {
    console.log('req',req.session)
    let token = req.cookies.access_token
    // let token = req.headers["x-auth-token"]
    console.log(token)
    if(token){
        jwt.verify(token, 'capstone3', (err,decoded)=>{
            console.log(decoded)
            if(decoded.isAdmin === false) return next(Error.createError(401, "Unauthorized"))
        })
    }else{
        return res.status(400).json({status:400, message: "Please log in"})
    }
    
}

