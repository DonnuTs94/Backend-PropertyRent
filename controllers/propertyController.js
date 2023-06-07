const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const propertyController = {
  createProperty: async (req, res) => {
    const { name, description, rules, facilities } = req.body
    const categoryId = parseInt(req.body.categoryId)
    const provinceId = parseInt(req.body.provinceId)
    const cityId = parseInt(req.body.cityId)
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

      const files = req.files
      let img_path = []

      img_path = files.map((file) => file.filename)

      const propertyImages = img_path.map((item) => {
        return {
          propertyPicUrl: item,
          propertyId: createNewProperty.id,
        }
      })

      await prisma.propertyImages.createMany({
        data: propertyImages,
      })

      const foundPropertyById = await prisma.properties.findUnique({
        where: {
          id: createNewProperty.id,
        },
        include: { propertyImages: true, user: true },
      })

      return res.status(200).json({
        message: "Successfull create property",
        data: foundPropertyById,
      })
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  updateProperty: async (req, res) => {
    try {
      const updateProperty = await prisma.properties.update({
        where: {
          id: req.params.id,
        },
        data: {
          ...req.body,
        },
      })

      return res.status(200).json({
        message: "Success update property",
        data: updateProperty,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
}

module.exports = propertyController
