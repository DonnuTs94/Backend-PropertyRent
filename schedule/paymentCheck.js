const { PrismaClient } = require("@prisma/client")
const schedule = require("node-schedule")

const prisma = new PrismaClient()
const paymentCheck = (objectOrders) => {
  schedule.scheduleJob(objectOrders.expDate, async () => {
    const getOrders = await prisma.orders.findFirst({
      where: {
        id: objectOrders.id,
      },
    })

    if (objectOrders.status.status === "Waiting for Payment") {
      console.log("Hello")
      await prisma.orders.update({
        where: {
          id: getOrders.id,
        },
        data: {
          statusId: "4d3e4d6a-2521-47ff-b94c-c93e0ac06179",
        },
      })
    }
  })
}

module.exports = paymentCheck
