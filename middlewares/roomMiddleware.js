const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const verifyRoomOwnership = async (req, res, next) => {
  try {
    const foundRoomOwnership = await prisma.rooms.findFirst({
      where: {
        id: req.params.id,
      },
      include: {
        property: true,
      },
    })

    if (!foundRoomOwnership) {
      return res.status(400).json({
        message: "Room doesn't exist",
      })
    }

    if (foundRoomOwnership.property.userId !== req.user.id) {
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

const validateMaxLengthRoomImages = async (req, res, next) => {
  try {
    const roomImagesLength = await prisma.roomImages.findMany({
      where: {
        roomId: req.params.id,
      },
    })

    const maxImagesLength = 6
    if (roomImagesLength.length < maxImagesLength) {
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

const verifyRoomImageOwenership = async (req, res, next) => {
  try {
    const foundRoomImage = await prisma.roomImages.findFirst({
      where: {
        id: req.params.id,
      },
      include: {
        room: {
          include: {
            property: true,
          },
        },
      },
    })

    if (!foundRoomImage) {
      return res.status(400).json({
        message: "Image doesn't exist",
      })
    }

    if (foundRoomImage.room.property.userId !== req.user.id) {
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
module.exports = {
  verifyRoomOwnership,
  validateMaxLengthRoomImages,
  verifyRoomImageOwenership,
}
