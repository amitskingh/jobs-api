const CustomAPIError = require("./custom-error")

class UnauthorizedError extends CustomAPIError {
  constructor(message) {
    super(message, 403)
  }
}

module.exports = UnauthorizedError
