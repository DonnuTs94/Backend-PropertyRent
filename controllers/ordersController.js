const { PrismaClient } = require("@prisma/client")
const moment = require("moment")
const {
  UNIQUE_CONSTRAINT,
  TARGET_ORDERS_ROOMID,
} = require("../configs/constant/databaseError")

const prisma = new PrismaClient()

const ordersController = {
  createOrder: async (req, res) => {
    try {
      const foundRoomId = await prisma.rooms.findFirst({
        where: {
          id: req.params.id,
        },
        include: {
          roomPrice: true,
        },
      })

      const foundRoomPrice = await prisma.roomPrice.findMany({
        where: {
          roomId: req.params.id,
        },
      })

      let startDate = new Date(req.body.startDate)
      let endDate = new Date(req.body.endDate)

      const expDate = moment(startDate)
        .add(2, "hours")
        .format("YYYY-MM-DDTHH:MM:SSZ")

      const totalPrice = foundRoomPrice.reduce((sum, item) => {
        const itemDate = moment(item.date)
        if (
          itemDate.isSameOrAfter(startDate, "day") &&
          itemDate.isSameOrBefore(endDate, "day")
        ) {
          return sum + item.price
        }
        return sum
      }, 0)

      console.log(totalPrice)
      const createOrders = await prisma.orders.create({
        data: {
          roomId: foundRoomId.id,
          startDate: startDate,
          endDate: endDate,
          expDate: expDate,
          userId: "b3af4e3e-755c-4141-b5ba-c5a0dd86edb8",
          totalPrice: totalPrice,
          statusId: "3f2f931f-a14c-4734-96ee-c31722fddd94",
        },
      })

      return res.status(200).json({
        message: "Success create new order",
        data: createOrders,
      })
    } catch (err) {
      if (
        err?.code === "P2002" &&
        err?.meta?.target?.includes("Orders_roomId_key")
      ) {
        return res.status(400).json({
          message: "Room is Full",
        })
      }
      return res.status(500).json({
        message: err.message,
      })
    }
  },
}

module.exports = ordersController
