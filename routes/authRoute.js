const express = require("express")
const authController = require("../controllers/authController")
const router = express.Router()
const {
  verifyToken,
  verifyRoleUser,
  verifyRoleTenant,
} = require("../middlewares/authMiddleware")
const {
  validateFileUpload,
} = require("../middlewares/imagesValidatorMiddleware")
const {
  TENANT_PROFILE_PATH,
  USER_PROFILE_PATH,
} = require("../configs/constant/uploadFilePath")
const {
  PROFILE_FIELDNAME,
  PROFILE_FILEPREFIX,
  FILE_TYPES,
  SIZE_2MB,
} = require("../configs/constant/upload")

router.post("/register/user", authController.registerUser)
router.post("/register/tenant", authController.registerTenant)
router.post("/user", authController.loginUser)
router.post("/tenant", authController.loginTenant)
router.get("/refresh-token", verifyToken, authController.refreshToken)
router.patch(
  "/user",
  verifyToken,
  verifyRoleUser,
  authController.updateUserProfile
)
router.patch(
  "/tenant",
  verifyToken,
  verifyRoleTenant,
  authController.updateTenantProfile
)
router.patch(
  "/user/passsword",
  verifyToken,
  verifyRoleUser,
  authController.updatePasswordUser
)
router.patch(
  "/tenant/password",
  verifyToken,
  verifyRoleTenant,
  authController.updatePasswordTenant
)

router.patch(
  "/user/profile",
  verifyToken,
  verifyRoleUser,
  validateFileUpload({
    path: USER_PROFILE_PATH,
    _fileTypes: FILE_TYPES,
    _filePrefix: PROFILE_FILEPREFIX,
    dbFileName: PROFILE_FIELDNAME,
    imgSize: SIZE_2MB,
    allowMultiple: false,
  }),
  authController.uploadProfileUser
)

router.patch(
  "/tenant/profile",
  verifyToken,
  verifyRoleTenant,
  validateFileUpload({
    path: TENANT_PROFILE_PATH,
    _fileTypes: FILE_TYPES,
    _filePrefix: PROFILE_FILEPREFIX,
    dbFileName: PROFILE_FIELDNAME,
    imgSize: SIZE_2MB,
    allowMultiple: false,
  }),
  authController.uploadProfileTenant
)

module.exports = router
