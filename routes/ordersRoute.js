const expres = require("express")
const ordersController = require("../controllers/ordersController")
const { verifyRoleUser, verifyToken } = require("../middlewares/authMiddleware")

const router = expres.Router()

router.post("/:id", verifyToken, verifyRoleUser, ordersController.createOrder)

module.exports = router
