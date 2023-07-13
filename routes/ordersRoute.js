const expres = require("express")
const ordersController = require("../controllers/ordersController")
const { verifyRoleUser, verifyToken } = require("../middlewares/authMiddleware")
const {
  validateFileUpload,
} = require("../middlewares/imagesValidatorMiddleware")
const {
  FILE_TYPES,
  SIZE_1MB,
  PAYMENTPROOF_FIELDNAME,
  PAYMENTPROOF_FILLEPREFIX,
} = require("../configs/constant/upload")
const { USER_PAYMENTPROOF_PATH } = require("../configs/constant/uploadFilePath")
const router = expres.Router()

router.post("/:id", verifyToken, verifyRoleUser, ordersController.createOrder)
router.patch(
  "/payment-proof/:id",
  verifyToken,
  verifyRoleUser,
  validateFileUpload({
    _filePrefix: PAYMENTPROOF_FILLEPREFIX,
    _fileTypes: FILE_TYPES,
    dbFileName: PAYMENTPROOF_FIELDNAME,
    imgSize: SIZE_1MB,
    path: USER_PAYMENTPROOF_PATH,
    allowMultiple: false,
  }),
  ordersController.paymentProof
)

module.exports = router
