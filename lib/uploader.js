const multer = require("multer")
const { roleEnum } = require("../configs/constant.js")

const upload = ({
  filePrefix = "FILE",
  fileName = Date.now(),
  acceptedFileTypes = [],
  maxSize,
  dynamicDestination,
}) => {
  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dynamicPath = dynamicDestination
      // const dynamicPath = dynamicDestination(req,file)

      // cb(null, "public")
      cb(null, dynamicPath)
    },
    filename: (req, file, cb) => {
      const { originalname } = file
      fileName = originalname + Date.now()
      cb(null, `${filePrefix}-${fileName}.${file.mimetype.split("/")[1]}`)
    },
  })

  const fileFilter = (req, file, cb) => {
    const extension = file.mimetype.split("/")[1]

    if (acceptedFileTypes.includes(extension)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type"))
    }
  }

  return multer({
    storage: diskStorage,
    fileFilter,
    limits: { fileSize: maxSize },
  })
}

const dynamicDestination = (req, file) => {
  let dynamicPath = "public"

  console.log(req.user)
  if (
    // req.user.role === roleEnum.USER &&
    file.fieldname === "profilePicUrl"
  ) {
    dynamicPath = "public/user"
  }
  // else if (
  //   req.user.role === roleEnum.TENANT &&
  //   file.fieldname === "profilePicUrl"
  // ) {
  //   dynamicPath = "public/tenant"
  // }

  return dynamicPath
}

module.exports = {
  upload,
  dynamicDestination,
}
