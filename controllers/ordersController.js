const { PrismaClient } = require("@prisma/client")
const moment = require("moment")
const automaticPaymentCheck = require("../schedule/paymentCheck")
const fs = require("fs")
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
  paymentProof: async (req, res) => {
    try {
      const foundOrder = await prisma.orders.findFirst({
        where: {
          id: req.params.id,
        },
      })

      if (foundOrder.userId !== req.user.id) {
        return res.status(400).json({
          message: "User unautorized",
        })
      }

      if (foundOrder.status !== "waitingForPayment") {
        fs.unlinkSync(req.file.path)
        return res.status(400).json({
          message: "Not allowed to upload payment proof",
        })
      }

      const uploadPaymentProof = await prisma.orders.update({
        where: {
          id: foundOrder.id,
        },
        data: {
          paymentUrl: req.file.filename,
          status: "waitingForConfirmation",
        },
      })

      return res.status(200).json({
        message: "Success upload payment",
        data: uploadPaymentProof,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  userCancelOrder: async (req, res) => {
    try {
      const foundOrder = await prisma.orders.findFirst({
        where: {
          id: req.params.id,
        },
      })

      if (foundOrder.userId !== req.user.id) {
        return res.status(400).json({
          message: "User unauthorized",
        })
      }

      if (
        foundOrder.status !== "waitingForPayment" &&
        foundOrder.status !== "waitingForConfirmation"
      ) {
        return res.status(400).json({
          message: "Not allowed to cancel this order",
        })
      }

      const updateStatus = await prisma.orders.update({
        where: {
          id: foundOrder.id,
        },
        data: {
          status: "canceled",
        },
      })

      return res.status(200).json({
        message: "Success cancel this order",
        data: updateStatus,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  tenantApproveOrder: async (req, res) => {
    try {
      const foundOrder = await prisma.orders.findFirst({
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

      if (foundOrder.room.property.userId !== req.user.id) {
        return res.status(400).json({
          message: "Tenant unauthorized",
        })
      }

      if (foundOrder.status !== "waitingForConfirmation") {
        return res.status(400).json({
          message: "Not allowed to approve this order",
        })
      }

      const approveOrder = await prisma.orders.update({
        where: {
          id: foundOrder.id,
        },
        data: {
          status: "inProgress",
        },
      })

      return res.status(200).json({
        message: "Success approve this order",
        data: approveOrder,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
}

module.exports = ordersController
