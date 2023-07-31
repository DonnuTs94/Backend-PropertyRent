const { PrismaClient } = require("@prisma/client")
const moment = require("moment")
const prisma = new PrismaClient()

const search = {
  userGetAllProperty: async (req, res) => {
    try {
      // const propertyName = req.query.propertyName
      // const provincy = req.query.provincy
      // const city = req.query.city

      const { propertyName, provincy, city, page } = req.query
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

      const pageSize = 10
      const offset = (page - 1) * parseInt(pageSize)

      const foundProperties = await prisma.properties.findMany({
        take: pageSize,
        skip: offset,
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
          category: true,
          province: true,
          city: true,
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

      const avgReview = await prisma.review.groupBy({
        by: ["propertyId"],
        where: {
          propertyId: {
            in: foundProperties.map((property) => property.id),
          },
        },
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
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

      filterRoomOrder.forEach((d) => {
        const avgElement = avgReview.find((a) => a.propertyId == d.id)
        delete avgElement.propertyId
        d.review = avgElement
      })

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
  userGetPropertyDetail: async (req, res) => {
    try {
      const currentDate = new Date(moment().format("YYYY-MM-DD"))
      const startDate = req.query.startDate ? req.query.startDate : currentDate
      const endDate = req.query.endDate
        ? req.query.endDate
        : new Date(moment(currentDate).add(1, "day"))

      const foundPropertyById = await prisma.properties.findUnique({
        where: {
          id: req.params.id,
        },
        include: {
          propertyImages: true,
          province: true,
          city: true,
          category: true,
          rooms: {
            include: {
              order: true,
              roomImages: true,
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

      foundPropertyById.rooms = foundPropertyById.rooms.filter((room) => {
        const isUnavailable = room.order.some((od) => {
          return (
            od.startDate <= new Date(endDate) &&
            od.endDate >= new Date(startDate)
          )
        })
        delete room.order
        return !isUnavailable
      })

      return res.status(200).json({
        message: "Success",
        data: foundPropertyById,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  userGetRoomDetail: async (req, res) => {
    try {
      const foundRoomById = await prisma.rooms.findUnique({
        where: {
          id: req.params.id,
        },
        include: {
          roomImages: true,
        },
      })

      return res.status(200).json({
        message: "Success got room by id",
        data: foundRoomById,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
}

module.exports = search
