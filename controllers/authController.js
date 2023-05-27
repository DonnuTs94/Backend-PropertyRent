const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")
const { signToken } = require("../lib/jwt")

const prisma = new PrismaClient()

const authController = {
  registerUser: async (req, res) => {
    const { email, username, password, birthday, gender } = req.body
    try {
      const hashedPassword = bcrypt.hashSync(password, 5)
      const birthdayDate = new Date(birthday)

      const newUser = await prisma.user.create({
        data: {
          email: email,
          username: username,
          password: hashedPassword,
          birthday: birthdayDate,
          gender: gender,
          role: "User",
        },
      })

      res.status(200).json({
        newUser,
        message: "User registered",
      })
    } catch (err) {
      if (err.code === "P2002" && err.meta?.target?.includes("email")) {
        return res.status(400).json({
          message: "Email has already been taken",
        })
      }

      if (err.code === "P2002" && err.meta?.target?.includes("username")) {
        return res.status(400).json({
          message: "Username has already been taken",
        })
      }

      console.log(err)
      res.status(500).json({
        message: err.message,
      })
    }
  },
  registerTenant: async (req, res) => {
    const { email, username, password, birthday, gender } = req.body
    try {
      const hashedPassword = bcrypt.hashSync(password, 5)
      const birthdayDate = new Date(birthday)

      const newUser = await prisma.user.create({
        data: {
          email: email,
          username: username,
          password: hashedPassword,
          birthday: birthdayDate,
          gender: gender,
          role: "Tenant",
        },
      })

      res.status(200).json({
        newUser,
        message: "Tenant register",
      })
    } catch (err) {
      if (err.code === "P2002" && err.meta?.target?.includes("email")) {
        return res.status(400).json({
          message: "Email has already been taken",
        })
      }

      if (err.code === "P2002" && err.meta?.target?.includes("username")) {
        return res.status(400).json({
          message: "Username has already been taken",
        })
      }

      console.log(err)
      res.status(500).json({
        message: err.message,
      })
    }
  },
  loginUser: async (req, res) => {
    const { usernameOrEmail, password } = req.body
    try {
      const findUserByEmailOrUsername = await prisma.user.findFirst({
        where: {
          OR: [
            {
              email: usernameOrEmail,
            },
            {
              username: usernameOrEmail,
            },
          ],
        },
      })

      if (!findUserByEmailOrUsername) {
        return res.status(400).json({
          message: "User not found",
        })
      }

      const passwordIsValid = bcrypt.compareSync(
        password,
        findUserByEmailOrUsername.password
      )

      if (!passwordIsValid) {
        return res.status(400).json({
          message: "Password invalid",
        })
      }

      delete findUserByEmailOrUsername.dataValues.password

      console.log(findUserByEmailOrUsername)

      const token = signToken(findUserByEmailOrUsername.toJSON())

      return res.status(200).json({
        message: "User Login",
        data: findUserByEmailOrUsername,
        token,
      })
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        message: err.messasge,
      })
    }
  },
}

module.exports = authController
