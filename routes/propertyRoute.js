const express = require("express")
const propertyController = require("../controllers/propertyController")
const {
  verifyToken,
  verifyRoleTenant,
} = require("../middlewares/authMiddleware")
const {
  verifyTenantOwnership,
  validateMaxLengthImages,
  verifyImageOwenership,
} = require("../middlewares/propertyMiddleware")
const { TENANT_PROPERTY_PATH } = require("../configs/constant/uploadFilePath")
const {
  validateFileUpload,
} = require("../middlewares/imagesValidatorMiddleware")
const {
  FILE_TYPES,
  PROPERTY_FIELDNAME,
  PROPERTY_FILEPREFIX,
  SIZE_2MB,
} = require("../configs/constant/upload")

const route = express.Router()

route.post(
  "/",
  verifyToken,
  verifyRoleTenant,
  // validateCreatePropertyImageUpload((path = TENANT_PROPERTY_PATH)),
  validateFileUpload({
    path: TENANT_PROPERTY_PATH,
    _fileTypes: FILE_TYPES,
    _filePrefix: PROPERTY_FILEPREFIX,
    filePath: PROPERTY_FIELDNAME,
    imgSize: SIZE_2MB,
  }),
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
  validateFileUpload({
    path: TENANT_PROPERTY_PATH,
    _fileTypes: FILE_TYPES,
    _filePrefix: PROPERTY_FILEPREFIX,
    filePath: PROPERTY_FIELDNAME,
    imgSize: SIZE_2MB,
    allowMultiple: false,
  }),
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
