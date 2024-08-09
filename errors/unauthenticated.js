const CustomError = require("./custom-error")

class UnauthenticatedError extends CustomError {
  constructor(message) {
    super(message, 401)
  }
}

module.exports = UnauthenticatedError
