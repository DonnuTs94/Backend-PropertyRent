const express = require("express")
const propertyController = require("../controllers/propertyController")
const {
  verifyToken,
  verifyRoleTenant,
} = require("../middlewares/authMiddleware")
const {
  validateCreatePropertyImageUpload,
  verifyTenantOwnership,
  validatePostImagePropertyUpload,
  validateMaxLengthImages,
  verifyImageOwenership,
} = require("../middlewares/propertyMiddleware")
const { TENANT_PROPERTY_PATH } = require("../configs/constant/uploadFilePath")

const route = express.Router()

route.post(
  "/",
  verifyToken,
  verifyRoleTenant,
  validateCreatePropertyImageUpload(TENANT_PROPERTY_PATH),
  propertyController.createProperty
)

route.patch(
  "/:id",
  verifyToken,
  verifyRoleTenant,
  verifyTenantOwnership,
  propertyController.updateProperty
)

route.patch(
  "/delete/:id",
  verifyToken,
  verifyRoleTenant,
  verifyTenantOwnership,
  propertyController.softDeleteProperty
)

route.delete(
  "/delete/:id",
  verifyToken,
  verifyRoleTenant,
  verifyTenantOwnership,
  propertyController.deleteProperty
)

route.get(
  "/",
  verifyToken,
  verifyRoleTenant,
  propertyController.fetchAllTenantProperty
)

route.get(
  "/:id",
  verifyToken,
  verifyRoleTenant,
  verifyTenantOwnership,
  propertyController.fetchSpecificProperty
)

route.post(
  "/image/:id",
  verifyToken,
  verifyRoleTenant,
  verifyTenantOwnership,
  validateMaxLengthImages,
  validatePostImagePropertyUpload(TENANT_PROPERTY_PATH),
  propertyController.postPropertyImagePath
)

route.delete(
  "/image/:id",
  verifyToken,
  verifyRoleTenant,
  verifyImageOwenership,
  propertyController.deletePropertyImagePath
)

module.exports = route
