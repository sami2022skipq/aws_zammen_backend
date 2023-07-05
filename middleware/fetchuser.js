
const jwt = require('jsonwebtoken')
const JWt_secret = "mySecretSAMI"

const fetchuser = (req, res, next) => {
    // get a user from JWT token and add it to req object

    const token = req.header('auth-token')
    if (!token) {
        res.status(401).send({ error: " Please authenticate using valid token" })
    }

    try {
        const data = jwt.verify(token, JWt_secret)
        req.user = data.user
      
        next();

    } catch (error) {
        res.status(401).send({ error: " Please authenticate using valid token" })

    }
}



module.exports = fetchuser