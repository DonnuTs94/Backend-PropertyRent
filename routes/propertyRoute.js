const express = require("express")
const propertyController = require("../controllers/propertyController")
const reviewController = require("../controllers/reviewController")
const {
  verifyToken,
  verifyRoleTenant,
  verifyRoleUser,
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

const router = express.Router()

router.get("/all-property", propertyController.fetchAllProperty)

router.post(
  "/",
  verifyToken,
  verifyRoleTenant,
  validateFileUpload({
    path: TENANT_PROPERTY_PATH,
    _fileTypes: FILE_TYPES,
    _filePrefix: PROPERTY_FILEPREFIX,
    dbFileName: PROPERTY_FIELDNAME,
    imgSize: SIZE_2MB,
    allowMultiple: true,
  }),
  propertyController.createProperty
)

router.patch(
  "/:id",
  verifyToken,
  verifyRoleTenant,
  verifyTenantOwnership,
  propertyController.updateProperty
)

router.patch(
  "/delete/:id",
  verifyToken,
  verifyRoleTenant,
  verifyTenantOwnership,
  propertyController.softDeleteProperty
)

router.delete(
  "/delete/:id",
  verifyToken,
  verifyRoleTenant,
  verifyTenantOwnership,
  propertyController.deleteProperty
)

router.get(
  "/",
  verifyToken,
  verifyRoleTenant,
  propertyController.fetchAllTenantProperty
)

router.get(
  "/:id",
  verifyToken,
  verifyRoleTenant,
  verifyTenantOwnership,
  propertyController.fetchSpecificProperty
)

router.post(
  "/image/:id",
  verifyToken,
  verifyRoleTenant,
  verifyTenantOwnership,
  validateMaxLengthImages,
  validateFileUpload({
    path: TENANT_PROPERTY_PATH,
    _fileTypes: FILE_TYPES,
    _filePrefix: PROPERTY_FILEPREFIX,
    dbFileName: PROPERTY_FIELDNAME,
    imgSize: SIZE_2MB,
    allowMultiple: false,
  }),
  propertyController.postPropertyImagePath
)

router.delete(
  "/image/:id",
  verifyToken,
  verifyRoleTenant,
  verifyImageOwenership,
  propertyController.deletePropertyImagePath
)

router.post(
  "/:id/review",
  verifyToken,
  verifyRoleUser,
  reviewController.createReview
)

router.get(
  "/:id/review",
  verifyToken,
  verifyRoleUser,
  reviewController.getUserReview
)

router.patch(
  "/:id/review",
  verifyToken,
  verifyRoleUser,
  reviewController.editUserReview
)

module.exports = router
