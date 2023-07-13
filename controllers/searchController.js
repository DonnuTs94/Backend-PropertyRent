const { PrismaClient } = require("@prisma/client")
const moment = require("moment")
const prisma = new PrismaClient()

const search = {
  userGetAllProperty: async (req, res) => {
    try {
      const propertyName = req.query.propertyName
      const provincy = req.query.provincy
      const city = req.query.city
      const currentDate = new Date(moment().format("YYYY-MM-DD"))
      const startDate = req.query.startDate ? req.query.startDate : currentDate
      const endDate = req.query.endDate
        ? req.query.endDate
        : new Date(moment(currentDate, "YYYY-MM-DD").add(1, "day"))

      if (new Date(startDate) < currentDate) {
        return res.status(400).json({
          message: "Minimum search date is today",
        })
      }

      const foundProperties = await prisma.properties.findMany({
        where: {
          name: {
            contains: propertyName,
          },
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
        },
        include: {
          propertyImages: true,
          rooms: {
            include: {
              order: true,
              roomPrice: {
                where: {
                  date: {
                    gte: new Date(startDate),
                    lt: new Date(endDate),
                  },
                },
                orderBy: {
                  date: "asc",
                },
              },
            },
          },
        },
      })

      const filteredRoomPrice = foundProperties.filter((property) => {
        property.rooms = property.rooms.filter((room) => {
          if (room.roomPrice.length === 0) {
            return false
          }
          return true
        })

        if (property.rooms.length === 0) {
          return false
        }
        return true
      })

      const filterRoomOrder = filteredRoomPrice.filter((property) => {
        property.rooms = property.rooms.filter((room) => {
          const isUnavailable = room.order.some((od) => {
            return (
              od.startDate <= new Date(endDate) &&
              od.endDate >= new Date(startDate)
            )
          })
          delete room.order
          return !isUnavailable
        })
        return property.rooms.length === 0 ? false : true
      })

      if (filterRoomOrder.length === 0) {
        return res.status(400).json({
          message: "Data not found!",
        })
      }

      return res.status(200).json({
        message: "Success",
        data: filterRoomOrder,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
}

module.exports = search
