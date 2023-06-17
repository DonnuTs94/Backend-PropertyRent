const express = require("express")
const statusController = require("../controllers/status")

const router = express.Router()

router.post("/", statusController.createStatus)

module.exports = router
