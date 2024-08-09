require("dotenv").config()
require("express-async-errors")
const express = require("express")
const app = express()

const rateLimiter = require("express-rate-limit")
const xss = require("xss-clean")
const cors = require("cors")
const helmet = require("helmet")

// connectDB
const connectDB = require("./db/connect")

const authenticateUser = require("./middleware/authentication")
// routers
const authRouter = require("./routes/auth")
const jobsRouter = require("./routes/jobs")
const applicationRouter = require("./routes/application")

// error handler
const notFoundMiddleware = require("./middleware/not-found")
const errorHandlerMiddleware = require("./middleware/error-handler")

app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(xss())

// routes
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/jobs", authenticateUser, jobsRouter)
app.use("/api/v1/applications", authenticateUser, applicationRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 3000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    )
  } catch (error) {
    console.log(error)
  }
}

start()
