const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const reviewController = {
  createReview: async (req, res) => {
    try {
      const { rating, review } = req.body

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

      const foundUserReview = await prisma.review.findFirst({
        where: {
          userId: req.user.id,
          propertyId: req.params.id,
        },
      })

      if (foundUserReview) {
        return res.status(400).json({
          message: "You already have review for this property",
        })
      }

      if (!rating && !review) {
        return res.status(400).json({
          message: "input must be filled!",
        })
      }

      if (rating > 10) {
        return res.status(400).json({
          message: "Maximum rating is 10",
        })
      }

      const createReview = await prisma.review.create({
        data: {
          propertyId: foundProperty.id,
          userId: req.user.id,
          review: review,
          rating: rating,
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
  getUserReview: async (req, res) => {
    try {
      const foundUserReview = await prisma.review.findFirst({
        where: {
          userId: req.user.id,
          propertyId: req.params.id,
        },
      })

      return res.status(200).json({
        message: "Success",
        data: foundUserReview,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  editUserReview: async (req, res) => {
    try {
      const { rating, review } = req.body
      await prisma.review.update({
        where: {
          userId_propertyId: {
            propertyId: req.params.id,
            userId: req.user.id,
          },
        },
        data: {
          rating: rating,
          review: review,
        },
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
}

module.exports = reviewController
