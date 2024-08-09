const User = require("../models/User")
const { BadRequestError, UnauthenticatedError } = require("../errors")
const jwt = require("jsonwebtoken")

const register = async (req, res) => {
  // can be managed at frontend
  //   if (!name || !email || !password) {
  //     throw new BadRequestError("Please provide name, email and password")
  //   }

  const { role } = req.body
  if (!["employee", "employer"].includes(role)) {
    throw new BadRequestError("Role is undefined")
  }

  const user = await User.create({ ...req.body })
  const token = user.createJWT()
  res.status(201).json({ user: { name: user.name, role: user.role }, token })
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password")
  }

  const user = await User.findOne({ email })
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials")
  }
  // compare password
  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials")
  }

  const token = user.createJWT()
  res.status(201).json({ user: { name: user.name, role: user.role }, token })
}

module.exports = {
  register,
  login,
}
