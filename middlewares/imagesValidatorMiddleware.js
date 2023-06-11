const { LIMIT_FILE_SIZE } = require("../configs/constant/upload")
const { upload } = require("../lib/uploader")
const multer = require("multer")

const fs = require("fs")

const validateFileUpload = ({
  path,
  filePath,
  _fileTypes,
  _filePrefix,
  imgSize,
  allowMultiple = true,
}) => {
  return async (req, res, next) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }

    const handleMulterError = (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === LIMIT_FILE_SIZE) {
          return res.status(400).json({
            message: "File too large",
          })
        } else {
          return res.status(400).json({
            message: "File upload error: " + err.message,
          })
        }
      } else if (err) {
        return res.status(400).json({
          message: "File upload error: " + err.message,
        })
      }

      if (allowMultiple) {
        if (!req.files) {
          return res.status(400).json({
            message: "No file selected",
          })
        }

        const maxFileCount = allowMultiple ? 6 : 1

        if (req.files.length > maxFileCount) {
          req.files.map((file) => {
            fs.unlinkSync(file.path)
          })
          return res.status(400).json({
            message:
              "Too many files uploaded. Maximum allowed is " + maxFileCount,
          })
        }
      } else {
        if (!req.file) {
          return res.status(400).json({
            message: "No file selected",
          })
        }
      }

      next()
    }

    const uploadMiddleware = upload({
      acceptedFileTypes: _fileTypes,
      filePrefix: _filePrefix,
      maxSize: imgSize,
      dynamicDestination: path,
    })

    if (allowMultiple) {
      uploadMiddleware.array(filePath)(req, res, function (err) {
        handleMulterError(err)
      })
    } else {
      uploadMiddleware.single(filePath)(req, res, function (err) {
        handleMulterError(err)
      })
    }
  }
}

module.exports = { validateFileUpload }
