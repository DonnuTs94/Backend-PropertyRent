const express = require("express")
const roomController = require("../controllers/roomController")
const {
  verifyToken,
  verifyRoleTenant,
} = require("../middlewares/authMiddleware")
const {
  validateFileUpload,
} = require("../middlewares/imagesValidatorMiddleware")
const {
  ROOM_FIELDNAME,
  ROOM_FILEPREFIX,
  FILE_TYPES,
  SIZE_2MB,
} = require("../configs/constant/upload")
const { TENANT_ROOM_PATH } = require("../configs/constant/uploadFilePath")

const router = express.Router()

router.post(
  "/:id",
  verifyToken,
  verifyRoleTenant,
  validateFileUpload({
    _filePrefix: ROOM_FILEPREFIX,
    _fileTypes: FILE_TYPES,
    path: TENANT_ROOM_PATH,
    dbFileName: ROOM_FIELDNAME,
    imgSize: SIZE_2MB,
    allowMultiple: true,
  }),
  roomController.createRoom
)

router.get(
  "/all-room/:id",
  verifyToken,
  verifyRoleTenant,
  roomController.fetchAllRoom
)
router.get(
  "/:id",
  verifyToken,
  verifyRoleTenant,
  roomController.fetchSpecificRoom
)
module.exports = router
