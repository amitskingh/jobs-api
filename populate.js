const connectDB = require("./db/connect")
require("dotenv").config()
// const schema = require("./models/Job")
const schema = require("./models/User")
// const schema = require("./models/Book")

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    await schema.deleteMany()
    console.log("Successfull!")
    process.exit(0)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

start()
