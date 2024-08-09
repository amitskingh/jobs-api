const CustomAPIError = require("./custom-error")

class BadRequestError extends CustomAPIError {
  constructor(message) {
    super(message, 400)
  }
}

module.exports = BadRequestError
