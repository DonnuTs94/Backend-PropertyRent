const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const verifyTenantOwnership = async (req, res, next) => {
  try {
    const foundTenantOwnership = await prisma.properties.findFirst({
      where: {
        id: req.params.id,
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
        id: req.params.id,
      },
      include: {
        property: true,
      },
    })

    if (!foundPropertyImage) {
      return res.status(400).json({
        message: "Image doesn't exist",
      })
    }

    if (foundPropertyImage.property.userId !== req.user.id) {
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

const validateMaxLengthImages = async (req, res, next) => {
  try {
    const propertyImagesLength = await prisma.propertyImages.findMany({
      where: {
        propertyId: req.params.id,
      },
    })

    const maxImagesLength = 6
    if (propertyImagesLength.length < maxImagesLength) {
      next()
    } else {
      return res.status(400).json({
        message: "You have maximum images files",
      })
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    })
  }
}

module.exports = {
  verifyTenantOwnership,
  validateMaxLengthImages,
  verifyImageOwenership,
}
