const express = require('express')
const router = express.Router()


const bcrypt = require('bcryptjs')
// Models
const User = require('../models/User')
const  Token = require('../models/Token.model')

const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken')
const decode = require('jwt-decode')
const crypto = require("crypto");
const sendEmail = require("../utils/email/sendEmail")
// ENV variables
const bcryptSalt = process.env.BCRYPT_SALT;
const clientURL = process.env.CLIENT_URL;

//Middleware
const fetchuser = require('../middleware/fetchuser')

// const test = require('../utils/email/template')
// ROUTE 1:Create user using POST "/api/auth/createUser". No login required
const JWt_secret = "mySecretSAMI"
router.post('/createUser', [

    // Basic critaria for creating a new user
    body('name', "Name should be atleast three characters").isLength({ min: 3 }),
    body('email', "Enter a valid email").isEmail(),
    body('password', "Minimum password length has to be five characters ").isLength({ min: 5 }),

], async (req, res) => {
    let success = false
    // if there is an error return bad req 400, and erros
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    // check weathere user with this email already exsist or not 
    try {
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            
            return res.status(400).json({success, error: `User with email '${user.email}' already exsist` })
        }
        // generating password hash for user, 
        let salt = bcrypt.genSaltSync(10)
        let secPass = bcrypt.hashSync(req.body.password, salt)

        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
            phoneNumber: req.body.phoneNumber
        })
        //Enabling JWT auth token 
        const data = {
            user: {
                id: user.id,

            }
        }
        const authToken = jwt.sign(data, JWt_secret)
        success= true
        res.json({success,  authToken })
    } catch (error) {
        console.log("here is the error ", error.message)
        res.status(500).send("Internal Server error ")

    }

})

// ROUTE 2:  LOGIN Uthenticate a user uding POST /api/auth/login : No login required

router.post('/login', [

    // Basic critaria for creating a new user
    body('email', "Enter a valid email").isEmail(),
    body('password', "Minimum password length has to be five characters ").isLength({ min: 5 }),

], async (req, res) => {
    let success= false

    // if there is an error return bad req 400, and erros
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email })
        if (!user) {
            
            return res.status(400).json({ success, error: `Please login with correct credentials ` })
        }
        let passwordCompare = bcrypt.compareSync(password, user.password)
        if (!passwordCompare) {
         
            return res.status(400).json({ success, error: `Please login with correct credentials` })
        }

        // Using JWT token and JWT_secret  
        const data = {
            user: {
                id: user.id,


            }
        }
        const authToken = jwt.sign(data, JWt_secret)
        console.log(decode( authToken))
        success= true
        res.json({success, authToken })
    } catch (error) {
        console.log("here is the error ", error.message)
        res.status(500).send("Internal Server error ")


    }


})


//ROUTE 3 : Get user detail using authentication token POST /api/auth/getuser : Login required

router.post('/getuser', fetchuser, async (req, res) => {
    try {
        
        const userId = req.user.id   // geting userId from fetchuser
        const user = await User.findById(userId).select("-password")
        res.send(user)
        
    } catch (error) {
        
        console.log("here is the error ", error.message)
        res.status(500).send("Internal Server error ")
    }
    
    
    
})

//ROUTE 4 : request rest password /api/auth/requestResetPassword

router.post('/requestResetPassword', async (req, res)=>{
    const {email} = req.body
    const user = await User.findOne({email:email}).select("-password")
    if(!user){
        return     res.status(404).json({success: false, msg: `User having ${email} doesn't exsis`})
    }
    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();

    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));
  
    await new Token({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    }).save();

    const link = `${clientURL}/passwordReset?token=${resetToken}&id=${user._id}`;
    
    sendEmail(
        user.email,
        "Password Reset Request",
        {
          name: user.name,
          link: link,
        },
        "./template/requestResetPassword.handlebars"
      );
    //   return { link };

    res.status(200).json({success: true, msg: `Password reset link sent on  ${email} validity 24hrz` , email, token :link})

     
})

//ROUTE 5 : rest password /api/auth/resetpassword

router.post ('/resetpassword' , async (req, res)=>{
// (userId, token, password) => 
    const {userId, token, password} = req.body
    let passwordResetToken = await Token.findOne({ userId });
  
    if (!passwordResetToken) {
        return res.status(404).json( {success: false, msg: "Invalid or expired password reset token" });
    //   throw new Error("Invalid or expired password reset token");
    }
  
    console.log(passwordResetToken.token, token);
  
    const isValid = await bcrypt.compare(token, passwordResetToken.token);
  
    if (!isValid) {
    //   throw new Error("Invalid or expired password reset token");
      return res.status(404).json( {success: false, msg: "Invalid or expired password reset token" });
    }
  
    const hash = await bcrypt.hash(password, Number(bcryptSalt));
  
    await User.updateOne(
      { _id: userId },
      { $set: { password: hash } },
      { new: true }
    );
  
    const user = await User.findById({ _id: userId });
  
    sendEmail(
      user.email,
      "Password Reset Successfully",
      {
        name: user.name,
      },
      "./template/resetPassword.handlebars"
    );
  
    await passwordResetToken.deleteOne();
    
  
    res.status(200).json( {success: true, msg: "Password reset was successful" });
  })

//ROUTE TEST :


// req.query.page

// router.post('/passwordreset', (req, res)=>{

//     let token = req.query.token
//     const id = req.query.id
//     res.status(200).json({token : token, Id :id})
// })

module.exports = router