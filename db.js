const mongoose = require('mongoose')
const mongoURI ="mongodb+srv://AbdulSAmi:ASMaccounts44@cluster0.rmvxjuc.mongodb.net/inotebook"

const connectToMonggo =()=>{
    // 
    mongoose.connect(mongoURI)
    .then(() => {
            console.log("Connected to mongodb");
        },
        err => { 
            console.log('error: '+ err)
        }
    );
}

module.exports = connectToMonggo;