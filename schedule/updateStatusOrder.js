const { PrismaClient } = require("@prisma/client")
const schedule = require("node-schedule")

const prisma = new PrismaClient()

const updateStatusOrder = (objectOrder) => {
  schedule.scheduleJob(objectOrder.endDate, async () => {
    await prisma.orders.update({
      where: {
        id: objectOrder.id,
      },
      data: {
        status: "completed",
      },
    })
  })
}

module.exports = updateStatusOrder
