const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const reviewController = {
  createReview: async (req, res) => {
    try {
      const foundProperty = await prisma.properties.findFirst({
        where: {
          id: req.params.id,
          rooms: {
            every: {
              order: {
                every: {
                  userId: req.user.id,
                  status: "completed",
                },
              },
            },
          },
        },
      })

      if (!foundProperty) {
        return res.status(400).json({
          message: "You not allowed to make review for this property",
        })
      }

      const createReview = await prisma.review.create({
        data: {
          propertyId: foundProperty.id,
          userId: req.user.id,
          review: req.body.review,
          rating: req.body.rating,
        },
      })

      return res.status(200).json({
        status: "Success",
        data: createReview,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
}

module.exports = reviewController
