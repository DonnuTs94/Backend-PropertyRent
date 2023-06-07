const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const propertyController = {
  createProperty: async (req, res) => {
    const {
      name,
      description,
      rules,
      facilities,
      categoryId,
      provinceId,
      cityId,
    } = req.body
    try {
      const foundUserById = await prisma.user.findFirst({
        where: {
          id: req.user.id,
        },
      })

      const foundCategoryById = await prisma.categories.findFirst({
        where: {
          id: categoryId,
        },
      })

      const foundProvinceById = await prisma.provincies.findFirst({
        where: {
          id: provinceId,
        },
      })

      const foundCityById = await prisma.cities.findFirst({
        where: {
          id: cityId,
        },
      })

      if (!foundCategoryById) {
        return res.status(400).json({
          message: "Category not found",
        })
      }

      if (!foundProvinceById) {
        return res.status(400).json({
          message: "Province not found",
        })
      }

      if (!foundCityById) {
        return res.status(400).json({
          message: "City not found",
        })
      }

      const createNewProperty = await prisma.properties.create({
        data: {
          name,
          description,
          rules,
          facilities,
          categoryId: foundCategoryById.id,
          provinceId: foundProvinceById.id,
          cityId: foundCityById.id,
          userId: foundUserById.id,
        },
      })

      return res.status(200).json({
        message: "Successfull create new property",
        data: createNewProperty,
      })
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        message: err.message,
      })
    }
  },
}

module.exports = propertyController
