const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")
const { signToken } = require("../lib/jwt")
const { roleEnum } = require("../configs/constant.js")

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
          role: roleEnum.USER,
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
          role: roleEnum.TENANT,
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
          AND: {
            role: roleEnum.USER,
          },
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

      delete findUserByEmailOrUsername.password

      const token = signToken({
        id: findUserByEmailOrUsername.id,
      })

      return res.status(200).json({
        message: "User Successfully Login",
        data: findUserByEmailOrUsername,
        token,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.messasge,
      })
    }
  },
  loginTenant: async (req, res) => {
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
          AND: {
            role: roleEnum.TENANT,
          },
        },
      })

      if (!findUserByEmailOrUsername) {
        return res.status(400).json({
          message: "Tenant not found",
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

      delete findUserByEmailOrUsername.password

      const token = signToken({ id: findUserByEmailOrUsername.id })

      return res.status(200).json({
        message: "Tenant Successfully Login",
        data: findUserByEmailOrUsername,
        token,
      })
    } catch (err) {
      res.status(500).json({
        message: err.message,
      })
    }
  },
  refreshToken: async (req, res) => {
    try {
      const findUserById = await prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
      })

      delete findUserById.password

      const renewedToken = signToken({
        id: req.user.id,
      })

      return res.status(200).json({
        message: "User token renewed",
        data: findUserById,
        token: renewedToken,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  updateUserProfile: async (req, res) => {
    try {
      const updateUserData = await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          ...req.body,
        },
      })

      delete updateUserData.password

      return res.status(200).json({
        message: "Update success",
        data: updateUserData,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  updateTenantProfile: async (req, res) => {
    try {
      const updateTenantData = await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          ...req.body,
        },
      })

      delete updateTenantData.password

      return res.status(200).json({
        message: "Update success",
        data: updateTenantData,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  updatePasswordUser: async (req, res) => {
    const { password, newPassword } = req.body
    try {
      const currentUser = await prisma.user.findFirst({
        where: {
          id: req.user.id,
        },
      })

      const passwordIsvalid = bcrypt.compareSync(password, currentUser.password)

      if (!passwordIsvalid) {
        return res.status(400).json({
          message: "Password invalid",
        })
      }

      const updatePassword = bcrypt.hashSync(newPassword, 5)

      const newPasswordUser = await prisma.user.update({
        where: {
          id: currentUser.id,
        },
        data: {
          password: updatePassword,
        },
      })

      delete newPasswordUser.password

      return res.status(200).json({
        message: "Successfully update user password",
        data: newPasswordUser,
      })
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  updatePasswordTenant: async (req, res) => {
    const { password, newPassword } = req.body
    try {
      const currentUser = await prisma.user.findFirst({
        where: {
          id: req.user.id,
        },
      })

      const passwordIsvalid = bcrypt.compareSync(password, currentUser.password)

      if (!passwordIsvalid) {
        return res.status(400).json({
          message: "Password invalid",
        })
      }

      const updatePassword = bcrypt.hashSync(newPassword, 5)

      const newPasswordTenant = await prisma.user.update({
        where: {
          id: currentUser.id,
        },
        data: {
          password: updatePassword,
        },
      })

      delete newPasswordTenant

      return res.status(200).json({
        message: "Successfully update tenant password",
        data: newPasswordTenant,
      })
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        message: err.message,
      })
    }
  },
}

module.exports = authController
