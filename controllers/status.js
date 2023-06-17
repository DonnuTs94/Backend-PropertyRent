const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const statusController = {
  createStatus: async (req, res) => {
    try {
      await prisma.status.create({
        data: {
          status: req.body.status,
        },
      })

      return res.status(200).json({
        message: "Success create new status",
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
}

module.exports = statusController
