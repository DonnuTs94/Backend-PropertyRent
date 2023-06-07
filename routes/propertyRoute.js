const express = require("express")
const propertyController = require("../controllers/propertyController")
const {
  verifyToken,
  verifyRoleTenant,
} = require("../middlewares/authMiddleware")

const route = express.Router()

route.post(
  "/",
  verifyToken,
  verifyRoleTenant,
  propertyController.createProperty
)

module.exports = route
