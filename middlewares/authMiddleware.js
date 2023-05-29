const { validToken } = require("../lib/jwt")
const { PrismaClient } = require("@prisma/client")
const { roleEnum } = require("../configs/constant.js")

const prisma = new PrismaClient()

const verifyToken = (req, res, next) => {
  let token = req.headers.authorization

  if (!token) {
    return res.status(401).json({
      message: "User unauthorized",
    })
  }

  try {
    token = token.split(" ")[1]

    const verifiedUser = validToken(token)

    if (!verifiedUser) {
      return res.status(401).json({
        message: "Unauthorized request",
      })
    }

    req.user = verifiedUser
    next()
  } catch (err) {
    return res.status(401).json({
      message: "Invalid Token",
    })
  }
}

const verifyRoleUser = async (req, res) => {
  try {
    const findUser = await prisma.user.findFirst({
      where: {
        id: req.user.id,
        AND: {
          role: roleEnum.USER,
        },
      },
    })

    if (!findUser) {
      return res.status(400).json({
        message: "User unauthorized",
      })
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
    })
  }
}

const verifyRoleTenant = async (req, res) => {
  try {
    const findTenant = await prisma.user.findFirst({
      where: {
        id: req.user.id,
        AND: {
          role: roleEnum.TENANT,
        },
      },
    })

    if (!findTenant) {
      return res.status(400).json({
        message: "Tenant unauthorized",
      })
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
    })
  }
}

module.exports = { verifyToken, verifyRoleUser, verifyRoleTenant }
