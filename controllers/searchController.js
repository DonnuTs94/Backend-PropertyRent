const { PrismaClient } = require("@prisma/client")
const moment = require("moment")
const prisma = new PrismaClient()

const search = {
  mainSearch: async (req, res) => {
    try {
      const provincy = req.query.provincy
      const city = req.query.city
      const startDate = req.query.startDate
      const endDate = req.query.endDate
      const currentDate = new Date()

      // Memeriksa apakah startDate kurang dari atau sama dengan tanggal hari ini
      if (new Date(startDate) < currentDate) {
        return res.status(400).json({
          message: "Minimum search date is today",
        })
      }

      const foundProperties = await prisma.properties.findMany({
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
        },
        include: {
          rooms: {
            include: {
              roomPrice: {
                where: {
                  date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
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

      const availableProperties = await Promise.all(
        foundProperties.map(async (property) => {
          const roomIds = property.rooms.map((room) => room.id)

          const orders = await prisma.orders.findMany({
            where: {
              roomId: {
                in: roomIds,
              },
              OR: [
                {
                  startDate: {
                    lte: new Date(endDate),
                  },
                  endDate: {
                    gte: new Date(startDate),
                  },
                },
              ],
            },
          })

          const isRoomAvailable = property.rooms.every((room) => {
            const isPriceUnavailable = orders.some(
              (order) =>
                order.startDate <= new Date(endDate) &&
                order.endDate >= new Date(startDate)
            )
            return !isPriceUnavailable
          })

          if (isRoomAvailable) {
            // Menghapus room yang tidak tersedia pada tanggal tertentu
            property.rooms = property.rooms.filter((room) => {
              const roomPriceDates = new Set(
                room.roomPrice.map(
                  (price) => price.date.toISOString().split("T")[0]
                )
              )

              // Memeriksa apakah semua tanggal dalam rentang waktu dimiliki oleh roomPrice
              for (
                let date = new Date(startDate);
                date <= new Date(endDate);
                date.setDate(date.getDate() + 1)
              ) {
                if (!roomPriceDates.has(date.toISOString().split("T")[0])) {
                  return false
                }
              }

              return true
            })

            return property
          }

          return null
        })
      )

      const filteredProperties = availableProperties.filter(
        (property) => property !== null && property.rooms.length > 0
      )

      if (filteredProperties.length === 0) {
        return res.status(400).json({
          message: "No available rooms",
        })
      }

      return res.status(200).json({
        message: "Success",
        data: filteredProperties,
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
