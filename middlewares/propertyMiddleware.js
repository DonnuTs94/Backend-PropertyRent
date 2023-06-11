const {
  FILE_TYPES,
  PROPERTY_FIELDNAME,
  PROPERTY_FILEPREFIX,
  LIMIT_FILE_SIZE,
} = require("../configs/constant/upload")
const { upload } = require("../lib/uploader")
const multer = require("multer")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()
const fs = require("fs")

const validateCreatePropertyImageUpload = (path) => {
  return async (req, res, next) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }

    upload({
      acceptedFileTypes: FILE_TYPES,
      filePrefix: PROPERTY_FILEPREFIX,
      maxSize: 2 * 1024 * 1024, //2MB
      dynamicDestination: path,
    }).array(PROPERTY_FIELDNAME)(req, res, function (err) {
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

      if (!req.files) {
        return res.status(400).json({
          message: "No file selected",
        })
      }

      const maxFileCount = 6
      if (req.files.length > maxFileCount) {
        req.files.map((file) => {
          fs.unlinkSync(file.path)
        })
        return res.status(400).json({
          message:
            "Too many files uploaded. Maximum allowed is " + maxFileCount,
        })
      }

      next()
    })
  }
}

const verifyTenantOwnership = async (req, res, next) => {
  try {
    const foundTenantOwnership = await prisma.properties.findFirst({
      where: {
        id: parseInt(req.params.id),
      },
    })

    if (!foundTenantOwnership) {
      return res.status(400).json({
        message: "Property doesn't exist",
      })
    }

    if (foundTenantOwnership.userId !== req.user.id) {
      return res.status(400).json({
        message: "Restricted",
      })
    }
    next()
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    })
  }
}

const verifyImageOwenership = async (req, res, next) => {
  try {
    const foundPropertyImage = await prisma.propertyImages.findFirst({
      where: {
        id: parseInt(req.params.id),
      },
    })

    if (!foundPropertyImage) {
      return res.status(400).json({
        message: "Image doesn't exist",
      })
    }

    const findPropertyId = await prisma.properties.findUnique({
      where: {
        id: foundPropertyImage.propertyId,
      },
    })

    if (findPropertyId.userId !== req.user.id) {
      return res.status(400).json({
        message: "Restircted",
      })
    }

    next()
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    })
  }
}

const validatePostImagePropertyUpload = (path) => {
  return async (req, res, next) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }

    upload({
      acceptedFileTypes: FILE_TYPES,
      filePrefix: PROPERTY_FILEPREFIX,
      maxSize: 2 * 1024 * 1024, //2MB
      dynamicDestination: path,
    }).single(PROPERTY_FIELDNAME)(req, res, function (err) {
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

      if (!req.file) {
        return res.status(400).json({
          message: "No file selected",
        })
      }

      next()
    })
  }
}

const validateMaxLengthImages = async (req, res, next) => {
  try {
    const propertyImagesLength = await prisma.propertyImages.findMany({
      where: {
        propertyId: parseInt(req.params.id),
      },
    })

    const maxImagesLength = 6
    if (propertyImagesLength.length < maxImagesLength) {
      next()
    } else {
      return res.status(400).json({
        message: "You have maximum images file",
      })
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    })
  }
}

module.exports = {
  validateCreatePropertyImageUpload,
  verifyTenantOwnership,
  validatePostImagePropertyUpload,
  validateMaxLengthImages,
  verifyImageOwenership,
}
