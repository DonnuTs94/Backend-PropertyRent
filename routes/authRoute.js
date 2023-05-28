const express = require("express")
const authController = require("../controllers/authController")
const router = express.Router()
const { verifyToken } = require("../middlewares/authMiddleware")

router.post("/register/user", authController.registerUser)
router.post("/register/tenant", authController.registerTenant)
router.post("/user", authController.loginUser)
router.post("/tenant", authController.loginTenant)
router.get("/refresh-token", verifyToken, authController.refreshToken)

module.exports = router
