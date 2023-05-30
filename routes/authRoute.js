const express = require("express")
const authController = require("../controllers/authController")
const router = express.Router()
const {
  verifyToken,
  verifyRoleUser,
  verifyRoleTenant,
} = require("../middlewares/authMiddleware")
const { upload } = require("../lib/uploader")

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
  upload({
    acceptedFileTypes: ["png", "jpg", "jpeg"],
    filePrefix: "profile_pic_url",
    maxSize: 2 * 1024 * 1024,
  }).single("profilePicUrl"),
  authController.uploadProfileUser
)

module.exports = router
