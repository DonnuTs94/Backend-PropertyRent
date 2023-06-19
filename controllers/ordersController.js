const { PrismaClient } = require("@prisma/client")
const moment = require("moment")
const automaticPaymentCheck = require("../schedule/paymentCheck")

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

      const foundRoomAvailable = await prisma.orders.findFirst({
        where: {
          roomId: foundRoomId.id,
          startDate: {
            lte: endDate,
          },
          endDate: {
            gte: startDate,
          },
        },
      })

      if (foundRoomAvailable) {
        return res.status(400).json({
          message: "Room is not available",
        })
      }

      const calculateTotalPrice = await prisma.roomPrice.aggregate({
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
          userId: "3235cd49-2594-4095-8419-65f479d01d3a",
          totalPrice: calculateTotalPrice._sum.price,
          statusId: "3f2f931f-a14c-4734-96ee-c31722fddd94",
        },
      })

      const ordersDataResult = await prisma.orders.findUnique({
        where: {
          id: createOrders.id,
        },
        include: { status: true },
      })

      automaticPaymentCheck(ordersDataResult)

      return res.status(200).json({
        message: "Success create new order",
        data: ordersDataResult,
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
