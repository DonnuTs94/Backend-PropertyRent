const { PrismaClient, Status } = require("@prisma/client")
const moment = require("moment")
const automaticPaymentCheck = require("../schedule/paymentCheck")
const fs = require("fs")
const prisma = new PrismaClient()
const updateStatusOrder = require("../schedule/updateStatusOrder")

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

      updateStatusOrder(approveOrder)

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
  tenantCancleOrder: async (req, res) => {
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
          message: "User unauthorized",
        })
      }

      if (
        foundOrder.status !== "waitingForPayment" &&
        foundOrder.status !== "waitingForConfirmation"
      ) {
        return res.status(400).json({
          message: "Not allowed cancel this order",
        })
      }

      const tenantCancelOrder = await prisma.orders.update({
        where: {
          id: foundOrder.id,
        },
        data: {
          status: "canceledTenant",
        },
      })

      return res.status(200).json({
        message: "Success cancel this order",
        data: tenantCancelOrder,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  userAllOrderList: async (req, res) => {
    try {
      const { status, id, sortId, sortDate, page } = req.query
      const pageSize = 10
      const offset = (page - 1) * parseInt(pageSize)

      const fetchAllUserOrder = await prisma.orders.findMany({
        take: pageSize,
        skip: offset,
        where: {
          userId: req.user.id,
          status: {
            equals: status,
          },
          id: {
            contains: id,
          },
        },
        orderBy: {
          id: sortId,
          createdAt: sortDate,
        },
        include: {
          room: {
            include: {
              property: {
                include: {
                  propertyImages: true,
                },
              },
            },
          },
        },
      })

      if (fetchAllUserOrder.length === 0) {
        return res.status(400).json({
          message: "Data not found",
        })
      }

      return res.status(200).json({
        message: "Success",
        data: fetchAllUserOrder,
        page,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  tenantAllOrderlist: async (req, res) => {
    try {
      const filterStatus = req.query.status
      const fetchAllTenantOrder = await prisma.properties.findMany({
        where: {
          userId: req.user.id,
        },
        select: {
          name: true,
          rooms: {
            select: {
              name: true,
              order: {
                select: {
                  id: true,
                  status: true,
                },
                where: {
                  status: filterStatus,
                },
              },
            },
          },
        },
      })

      const filteredOrder = fetchAllTenantOrder.filter((property) => {
        property.rooms = property.rooms.filter((room) => {
          if (room.order.length === 0) {
            return false
          }
          return true
        })
        if (property.rooms.length === 0) {
          return false
        }
        return true
      })

      return res.status(200).json({
        message: "Success fetch all tenant orders",
        data: filteredOrder,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
}

module.exports = ordersController
