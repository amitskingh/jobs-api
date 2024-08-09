// const { CustomAPIError } = require("../errors")
const errorHandlerMiddleware = (err, req, res, next) => {
  const customError = {
    msg: err.message || "Something went wrong try again later",
    statusCode: err.statusCode || 500,
  }
  // if (err instanceof CustomAPIError) {
  //   return res.status(err.statusCode).json({ msg: err.message })
  // }

  if (err.name === "ValidationError") {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ")

    customError.statusCode = 400
  }

  if (err.name === "CastError") {
    customError.msg = `No item found with id: ${err.value}`
    customError.statusCode = 404
  }

  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value entered for the ${Object.keys(
      err.keyValue
    )}, please provide another value`
    customError.statusCode = 400
  }
  // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err })
  console.log(customError.msg);
  return res.status(customError.statusCode).json({ msg: customError.msg })
}

module.exports = errorHandlerMiddleware
