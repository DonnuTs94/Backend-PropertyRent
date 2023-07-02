const { PrismaClient } = require("@prisma/client")
const moment = require("moment")
const prisma = new PrismaClient()

const search = {
  mainSearch: async (req, res) => {
    try {
      const provincy = req.query.provincy
      const city = req.query.city
      const queryDate = req.query.date
      const currentDate = moment().format("YYYY-MM-DD")
      const date = queryDate ? new Date(queryDate) : new Date(currentDate)
      console.log(date)
      const foundProperty = await prisma.properties.findMany({
        where: {
          province: {
            provincy: {
              contains: provincy,
            },
          },
          city: {
            city: {
              contains: city,
            },
          },
          rooms: {
            every: {
              roomPrice: {
                every: {
                  date: {
                    gte: new Date("2023-07-06"),
                    // lte: date,
                  },
                },
              },
            },
          },
        },
        include: {
          rooms: {
            include: {
              roomPrice: {
                orderBy: {
                  price: "asc",
                },
              },
            },
          },
        },
      })

      if (foundProperty.length === 0) {
        return res.status(400).json({
          message: "Data not found",
        })
      }

      return res.status(200).json({
        message: "success",
        data: foundProperty,
        // data: date,
      })
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        message: err.message,
      })
    }
  },
}

module.exports = search
