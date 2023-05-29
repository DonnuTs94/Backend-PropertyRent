const express = require("express")
const authController = require("../controllers/authController")
const router = express.Router()
const {
  verifyToken,
  verifyRoleUser,
  verifyRoleTenant,
} = require("../middlewares/authMiddleware")

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

module.exports = router
