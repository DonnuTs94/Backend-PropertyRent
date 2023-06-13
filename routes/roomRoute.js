const express = require("express")
const roomController = require("../controllers/roomController")
const {
  verifyToken,
  verifyRoleTenant,
} = require("../middlewares/authMiddleware")
const { verifyTenantOwnership } = require("../middlewares/propertyMiddleware")
const {
  validateFileUpload,
} = require("../middlewares/imagesValidatorMiddleware")
const {
  validateRoomOwnership,
  validateMaxLengthRoomImages,
} = require("../middlewares/roomMiddleware")
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
  verifyTenantOwnership,
  roomController.fetchAllRoom
)
router.get(
  "/:id",
  verifyToken,
  verifyRoleTenant,
  validateRoomOwnership,
  roomController.fetchSpecificRoom
)

router.post(
  "/price/:id",
  verifyToken,
  verifyRoleTenant,
  validateRoomOwnership,
  roomController.createRoomPrice
)

router.post(
  "/image/:id",
  verifyToken,
  verifyRoleTenant,
  validateRoomOwnership,
  validateMaxLengthRoomImages,
  validateFileUpload({
    _filePrefix: ROOM_FILEPREFIX,
    _fileTypes: FILE_TYPES,
    path: TENANT_ROOM_PATH,
    dbFileName: ROOM_FIELDNAME,
    imgSize: SIZE_2MB,
    allowMultiple: false,
  }),
  roomController.postRoomImagePath
)
module.exports = router
