const jwt = require("jsonwebtoken")
const User = require("./models/User")

exports.isAdmin = (req, res, next) => {
    let token = req.headers["x-auth-token"]
    console.log(token)
    if(token){
        jwt.verify(token, 'capstone3', (err,decoded)=>{
            console.log(decoded)
            if(decoded.isAdmin === false) return res.status(401).json({
                status:401,
                message: "Unauthorized"
            })
            next()
        })
    }else{
        return res.status(400).json({status:400, message: "Please log in"})
    }
    
}

