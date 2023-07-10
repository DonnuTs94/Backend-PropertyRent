const { PrismaClient } = require("@prisma/client")
const moment = require("moment")
const automaticPaymentCheck = require("../schedule/paymentCheck")

const prisma = new PrismaClient()

const ordersController = {
  createOrder: async (req, res) => {
    try {
      let startDate = new Date(req.body.startDate)
      let endDate = new Date(req.body.endDate)

      const findUserisVerif = await prisma.user.findFirst({
        where: {
          id: req.user.id,
        },
      })

      if (findUserisVerif.isVerified === false) {
        return res.status(400).json({
          message: "Please verify your account before creating an order",
        })
      }

      const foundDataRoom = await prisma.rooms.findUnique({
        where: {
          id: req.params.id,
        },

        include: {
          order: {
            where: {
              startDate: {
                lte: endDate,
              },
              endDate: {
                gte: startDate,
              },
            },
          },
        },
      })

      if (foundDataRoom.order.length > 0) {
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

      if (calculateTotalPrice._sum.price === null) {
        return res.status(400).json({
          message: "Room is not available",
        })
      }

      const expDate = moment().add(2, "hours").toDate()

      const createOrders = await prisma.orders.create({
        data: {
          roomId: foundDataRoom.id,
          startDate: startDate,
          endDate: endDate,
          expDate: expDate,
          userId: findUserisVerif.id,
          totalPrice: calculateTotalPrice._sum.price,
          status: "waitingForPayment",
        },
      })

      automaticPaymentCheck(createOrders)

      return res.status(200).json({
        message: "Success create new order",
        data: createOrders,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
}

module.exports = ordersController
