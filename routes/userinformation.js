const express = require('express')
const Router = express.Router()
const User = require('../models/User')



Router.post('/', async(req, res)=>{
    const { id, name, phoneNumber } = req.body
    
    try {
        const user = await User.findById({_id:id}).select("-password")
        if (!user){
    
            return  res.status(404).json({success :false, msg: "User Not  a found"})
        }
        else{
            await User.updateOne(
                { _id: id },
                { $set: { name: name, phoneNumber:phoneNumber}  },
                { new: true }
              );
            
            return  res.status(201).json({success :true, msg: "information has been updated ", user})
        }
        
    } catch (error) {
        
        return  res.status(403).json({success :false, msg: "User Not b  found"})
        
    }

    
})
module.exports= Router