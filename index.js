
const connectToMonggo=  require('./db')
require("dotenv").config();
const express = require('express')
var cors = require('cors')

connectToMonggo();  

const app = express()
const port = 5000
console.log("user : ",process.env.URI_USER)
app.use(cors())
app.use(express.json())
// available routes
app.use('/api/auth',  require('./routes/auth'))   //authentication, SignUp, Login, Password Update
app.use('/api/notes',  require('./routes/notes'))  // user adds , CRUD
app.use('/api/userinformation', require('./routes/userinformation'))   // User personal information update

app.get('/', (req, res) => {
  res.send('Hello from the other side!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
