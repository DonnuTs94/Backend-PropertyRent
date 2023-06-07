const express = require("express")
const propertyController = require("../controllers/propertyController")
const {
  verifyToken,
  verifyRoleTenant,
} = require("../middlewares/authMiddleware")
const { validatePropertyUpload } = require("../middlewares/propertyMiddleware")
const { TENANT_PROPERTY_PATH } = require("../configs/constant/uploadFilePath")

const route = express.Router()

route.post(
  "/",
  verifyToken,
  verifyRoleTenant,
  validatePropertyUpload(TENANT_PROPERTY_PATH),
  propertyController.createProperty
)

route.patch(
  "/",
  verifyToken,
  verifyRoleTenant,
  propertyController.updateProperty
)

module.exports = route
