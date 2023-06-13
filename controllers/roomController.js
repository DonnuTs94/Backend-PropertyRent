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
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  fetchAllRoom: async (req, res) => {
    try {
      const foundPropertyById = await prisma.properties.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      })

      const fetchAllRoom = await prisma.rooms.findMany({
        where: {
          deleted: false,
          propertyId: foundPropertyById.id,
        },
        include: { roomImages: true, roomPrice: true },
      })

      return res.status(200).json({
        message: "Successfully fetch all room",
        data: fetchAllRoom,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  fetchSpecificRoom: async (req, res) => {
    try {
      const fetchRoomById = await prisma.rooms.findFirst({
        where: {
          id: req.params.id,
          AND: {
            deleted: false,
          },
        },
        include: { roomImages: true, roomPrice: true },
      })

      return res.status(200).json({
        message: "Successfully fetch room by Id",
        data: fetchRoomById,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  createRoomPrice: async (req, res) => {
    let inputDataPrice = []
    try {
      const foundRoomById = await prisma.rooms.findFirst({
        where: {
          id: req.params.id,
        },
      })

      inputDataPrice = req.body
      const dataRoomPrice = inputDataPrice.map((item) => {
        return {
          price: parseInt(item.price),
          date: new Date(item.date),
          roomId: foundRoomById.id,
        }
      })

      await prisma.roomPrice.createMany({
        data: dataRoomPrice,
      })

      const dataResult = await prisma.rooms.findUnique({
        where: {
          id: foundRoomById.id,
        },
        include: { roomPrice: true },
      })
      return res.status(200).json({
        message: "Successfull add new price and date",
        data: dataResult,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  postRoomImagePath: async (req, res) => {
    try {
      const postRoomImg = await prisma.roomImages.create({
        data: {
          roomPicUrl: req.file.filename,
          roomId: req.params.id,
        },
      })

      return res.status(200).json({
        message: "Success upload image room",
        data: postRoomImg,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
}

module.exports = roomController
