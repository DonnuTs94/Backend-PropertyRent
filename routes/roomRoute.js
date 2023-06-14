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
  verifyRoomOwnership,
  validateMaxLengthRoomImages,
  verifyRoomImageOwenership,
  verifyRoomPriceOwenership,
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
  verifyTenantOwnership,
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
  verifyRoomOwnership,
  roomController.fetchSpecificRoom
)

router.post(
  "/image/:id",
  verifyToken,
  verifyRoleTenant,
  verifyRoomOwnership,
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

router.delete(
  "/image/:id",
  verifyToken,
  verifyRoleTenant,
  verifyRoomImageOwenership,
  roomController.deleteRoomImage
)

router.patch(
  "/:id",
  verifyToken,
  verifyRoleTenant,
  verifyRoomOwnership,
  roomController.updateRoom
)

router.patch(
  "/delete/:id",
  verifyToken,
  verifyRoleTenant,
  verifyRoomOwnership,
  roomController.softDeleteRoom
)

router.delete(
  "/delete/:id",
  verifyToken,
  verifyRoleTenant,
  verifyRoomOwnership,
  roomController.deleteRoom
)

router.post(
  "/price/:id",
  verifyToken,
  verifyRoleTenant,
  verifyRoomOwnership,
  roomController.createRoomPrice
)

router.patch(
  "/price/:id",
  verifyToken,
  verifyRoleTenant,
  verifyRoomPriceOwenership,
  roomController.updatePrice
)

router.delete(
  "/price/:id",
  verifyToken,
  verifyRoleTenant,
  verifyRoomPriceOwenership,
  roomController.deletePrice
)
module.exports = router
