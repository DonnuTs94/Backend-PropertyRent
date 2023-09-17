const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")
const { signToken } = require("../lib/jwt")
const { roleEnum } = require("../configs/constant.js")
const fs = require("fs")
const handlebars = require("handlebars")
const emailer = require("../lib/emailer")

const {
  TENANT_PROFILE_PATH,
  USER_PROFILE_PATH,
} = require("../configs/constant/unlinkFilePath")
const {
  UNIQUE_CONSTRAINT,
  TARGET_EMAIL,
  TARGET_USERNAME,
} = require("../configs/constant/databaseError")
const {
  EMAIL_VALIDATOR,
  PASSWORD_VALIDATOR,
} = require("../configs/constant/regexValidator")
const { ENOENT_CODE } = require("../configs/constant/errorCode")
const moment = require("moment/moment")

const prisma = new PrismaClient()

const authController = {
  registerUser: async (req, res) => {
    const { email, username, password, birthday, gender } = req.body
    try {
      const hashedPassword = bcrypt.hashSync(password, 5)
      const birthdayDate = new Date(birthday)

      if (!username || !birthday || !gender) {
        return res.status(400).json({
          message: "input must be filled!",
        })
      }

      if (!email.match(EMAIL_VALIDATOR)) {
        return res.status(400).json({
          message: "Incorrect e-mail format",
        })
      }

      if (!password.match(PASSWORD_VALIDATOR)) {
        return res.status(400).json({
          message:
            "Password length minimum 8 ,must have 1 number, 1 capital and 1 symbol",
        })
      }

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

      const generateOtp = Math.round(Math.random() * 10000)
        .toString()
        .padStart(4, "0")
      await prisma.otp.create({
        data: {
          userId: newUser.id,
          otp: generateOtp,
          expTime: new Date(moment().add(15, "minutes")),
        },
      })

      const rawHTML = fs.readFileSync("templates/sendOtp.html", "utf-8")
      const compiledHTML = handlebars.compile(rawHTML)
      const htmlResult = compiledHTML({
        username,
        generateOtp,
      })

      await emailer({
        to: email,
        html: htmlResult,
        subject: "Your otp code",
      })

      res.status(200).json({
        newUser,
        message: "User registered",
      })
    } catch (err) {
      if (
        err.code === UNIQUE_CONSTRAINT &&
        err.meta?.target?.includes(TARGET_EMAIL)
      ) {
        return res.status(400).json({
          message: "Email has already been taken",
        })
      }

      if (
        err.code === UNIQUE_CONSTRAINT &&
        err.meta?.target?.includes(TARGET_USERNAME)
      ) {
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

      if (!username || !birthday || !gender) {
        return res.status(400).json({
          message: "input must be filled!",
        })
      }

      if (!email.match(EMAIL_VALIDATOR)) {
        return res.status(400).json({
          message: "Incorrect e-mail format",
        })
      }

      if (!password.match(PASSWORD_VALIDATOR)) {
        return res.status(400).json({
          message:
            "Password length minimum 8 ,must have 1 number, 1 capital and 1 symbol",
        })
      }

      const newTenant = await prisma.user.create({
        data: {
          email: email,
          username: username,
          password: hashedPassword,
          birthday: birthdayDate,
          gender: gender,
          role: roleEnum.TENANT,
        },
      })

      const generateOtp = Math.round(Math.random() * 10000)
        .toString()
        .padStart(4, "0")
      await prisma.otp.create({
        data: {
          userId: newTenant.id,
          otp: generateOtp,
          expTime: new Date(moment().add(15, "minutes")),
        },
      })

      const rawHTML = fs.readFileSync("templates/sendOtp.html", "utf-8")
      const compiledHTML = handlebars.compile(rawHTML)
      const htmlResult = compiledHTML({
        username,
        generateOtp,
      })

      await emailer({
        to: email,
        html: htmlResult,
        subject: "Your otp code",
      })

      res.status(200).json({
        newTenant,
        message: "Tenant register",
      })
    } catch (err) {
      if (
        err.code === UNIQUE_CONSTRAINT &&
        err.meta?.target?.includes(TARGET_EMAIL)
      ) {
        return res.status(400).json({
          message: "Email has already been taken",
        })
      }

      if (
        err.code === UNIQUE_CONSTRAINT &&
        err.meta?.target?.includes(TARGET_USERNAME)
      ) {
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

      if (!newPassword.match(PASSWORD_VALIDATOR)) {
        return res.status(400).json({
          message:
            "Password length minimum 8 ,must have 1 number, 1 capital and 1 symbol",
        })
      }

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

      if (!newPassword.match(PASSWORD_VALIDATOR)) {
        return res.status(400).json({
          message:
            "Password length minimum 8 ,must have 1 number, 1 capital and 1 symbol",
        })
      }

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
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  uploadProfileUser: async (req, res) => {
    try {
      const foundUserProfile = await prisma.user.findFirst({
        where: {
          id: req.user.id,
        },
      })

      if (foundUserProfile.profilePicUrl) {
        fs.unlinkSync(USER_PROFILE_PATH + foundUserProfile.profilePicUrl)
      }

      const uploadProfileUrl = await prisma.user.update({
        where: {
          id: foundUserProfile.id,
        },
        data: {
          profilePicUrl: req.file.filename,
        },
      })

      delete uploadProfileUrl.password

      return res.status(200).json({
        message: "Successfully upload profile picture",
        data: uploadProfileUrl,
      })
    } catch (err) {
      if (err.code === ENOENT_CODE) {
        fs.unlinkSync(req.file.path)
      }

      return res.status(500).json({
        message: err.message,
      })
    }
  },
  uploadProfileTenant: async (req, res) => {
    try {
      const foundTenantProfile = await prisma.user.findFirst({
        where: {
          id: req.user.id,
        },
      })

      if (foundTenantProfile.profilePicUrl) {
        fs.unlinkSync(TENANT_PROFILE_PATH + foundTenantProfile.profilePicUrl)
      }

      const uploadProfileUrl = await prisma.user.update({
        where: {
          id: foundTenantProfile.id,
        },
        data: {
          profilePicUrl: req.file.filename,
        },
      })

      delete uploadProfileUrl.password

      return res.status(200).json({
        message: "Successfully upload profile picture",
        data: uploadProfileUrl,
      })
    } catch (err) {
      if (err.code === ENOENT_CODE) {
        fs.unlinkSync(req.file.path)
      }
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  verifyUser: async (req, res) => {
    try {
      const foundUserOtp = await prisma.otp.findFirst({
        where: {
          userId: req.user.id,
        },
      })

      if (foundUserOtp.otp !== req.body.otp) {
        return res.status(400).json({
          message: "Invalid OTP",
        })
      }

      const currentDate = new Date()

      if (currentDate > foundUserOtp.expTime) {
        return res.status(400).json({
          message: "Otp expired and you have to generate new otp",
        })
      }

      await prisma.user.update({
        where: {
          id: foundUserOtp.userId,
        },
        data: {
          isVerified: true,
        },
      })

      await prisma.otp.delete({
        where: {
          id: foundUserOtp.id,
        },
      })

      return res.status(200).json({
        message: "Success verif user",
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  verifyTenant: async (req, res) => {
    try {
      const foundTenantOtp = await prisma.otp.findFirst({
        where: {
          userId: req.user.id,
        },
      })

      if (foundTenantOtp.otp !== req.body.otp) {
        return res.status(400).json({
          message: "Invalid OTP",
        })
      }

      const currentDate = new Date()

      if (currentDate > foundTenantOtp.expTime) {
        return res.status(400).json({
          message: "Otp expired and you have to generate new otp",
        })
      }

      await prisma.user.update({
        where: {
          id: foundTenantOtp.userId,
        },
        data: {
          isVerified: true,
        },
      })

      await prisma.otp.delete({
        where: {
          id: foundTenantOtp.id,
        },
      })

      return res.status(200).json({
        message: "Success verif tenant",
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
  resentOtp: async (req, res) => {
    try {
      const foundUserOtp = await prisma.otp.findFirst({
        where: {
          userId: req.user.id,
        },
        include: {
          user: true,
        },
      })

      const generateOtp = Math.round(Math.random() * 10000)
        .toString()
        .padStart(4, "0")
      const updateOtp = await prisma.otp.update({
        where: {
          id: foundUserOtp.id,
        },
        data: {
          otp: generateOtp,
          expTime: new Date(moment().add(15, "minutes")),
        },
      })

      const { email, username } = foundUserOtp.user

      const rawHTML = fs.readFileSync("templates/sendOtp.html", "utf-8")
      const compiledHTML = handlebars.compile(rawHTML)
      const htmlResult = compiledHTML({
        username,
        generateOtp,
      })

      await emailer({
        to: email,
        html: htmlResult,
        subject: "Your otp code",
      })

      return res.status(200).json({
        message: "Success generate new OTP",
        data: updateOtp,
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      })
    }
  },
}

module.exports = authController
