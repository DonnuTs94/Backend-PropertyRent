const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const roomController = {
  createRoom: async (req, res) => {
    const { name, facilities, bedType } = req.body
    const capacity = parseInt(req.body.capacity)

    const files = req.files
    let imagesPath = []
    try {
      const foundPropertyById = await prisma.properties.findFirst({
        where: {
          id: req.params.id,
        },
      })

      if (foundPropertyById.userId !== req.user.id) {
        return res.status(400).json({
          message: "Restricted",
        })
      }
      if (!name || !facilities || !capacity || !bedType) {
        return res.status(400).json({
          message: "Input must be filled",
        })
      }

      const roomDataInput = await prisma.rooms.create({
        data: {
          name,
          facilities,
          capacity,
          bedType,
          propertyId: foundPropertyById.id,
        },
      })

      imagesPath = files.map((file) => file.filename)
      const roomDataImages = imagesPath.map((item) => {
        return {
          roomPicUrl: item,
          roomId: roomDataInput.id,
        }
      })

      await prisma.roomImages.createMany({
        data: roomDataImages,
      })

      const roomDataResult = await prisma.rooms.findUnique({
        where: {
          id: roomDataInput.id,
        },
        include: { roomImages: true, property: true },
      })

      return res.status(200).json({
        message: "Successfull create room",
        data: roomDataResult,
      })
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        message: err.message,
      })
    }
  },
}

module.exports = roomController
