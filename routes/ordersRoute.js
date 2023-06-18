const expres = require("express")
const ordersController = require("../controllers/ordersController")

const router = expres.Router()

router.post("/:id", ordersController.createOrder)

module.exports = router
