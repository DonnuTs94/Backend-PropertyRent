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

    if (objectOrders.status === "waitingForPayment") {
      await prisma.orders.update({
        where: {
          id: getOrders.id,
        },
        data: {
          status: "canceled",
        },
      })
    }
  })
}

module.exports = paymentCheck
