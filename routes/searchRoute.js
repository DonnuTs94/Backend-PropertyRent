const express = require("express")
const router = express.Router()
const searchController = require("../controllers/searchController")

router.get("/", searchController.userGetAllProperty)
router.get("/property/:id", searchController.userGetPropertyDetail)
router.get("/room/:id", searchController.userGetRoomDetail)

module.exports = router
