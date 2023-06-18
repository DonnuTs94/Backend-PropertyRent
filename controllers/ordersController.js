const { PrismaClient } = require("@prisma/client")
const moment = require("moment")

const prisma = new PrismaClient()

const ordersController = {
  createOrder: async (req, res) => {
    try {
      const foundRoomId = await prisma.rooms.findFirst({
        where: {
          id: req.params.id,
        },
      })
      let startDate = new Date(req.body.startDate)
      let endDate = new Date(req.body.endDate)

      const sumPrice = await prisma.roomPrice.aggregate({
        _sum: {
          price: true,
        },
        where: {
          roomId: req.params.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      })

      const expDate = moment().add(2, "hours").toDate()

      const createOrders = await prisma.orders.create({
        data: {
          roomId: foundRoomId.id,
          startDate: startDate,
          endDate: endDate,
          expDate: expDate,
          userId: "a5910bda-5d7e-441d-acac-af394e26136f",
          totalPrice: sumPrice._sum.price,
          statusId: "e2f9dc65-5189-4c8b-8c95-42a120ed0518",
        },
      })

      return res.status(200).json({
        message: "Success create new order",
        data: createOrders,
      })
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        message: err.message,
      })
    }
  },
}

module.exports = ordersController
