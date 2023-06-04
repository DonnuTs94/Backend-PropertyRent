const jwt = require("jsonwebtoken")

const SECRETE_KEY = process.env.JWT_SECRETE_KEY

const signToken = (payload) => {
  return jwt.sign(payload, SECRETE_KEY, { expiresIn: "2h" })
}

const validToken = (token) => {
  return jwt.verify(token, SECRETE_KEY)
}

module.exports = {
  signToken,
  validToken,
}
