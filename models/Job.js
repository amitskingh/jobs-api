const mongoose = require("mongoose")

const JobSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, "Please provide company name"],
    maxlength: 50,
  },
  position: {
    type: String,
    required: [true, "Please provide position"],
    maxlength: 100,
  },
  location: {
    type: String,
  },
  // description: {
  //   type: String,
  //   maxlength: 1000,
  // },
  postDate: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: [true, "Please provide user"],
  },
})

module.exports = mongoose.model("Job", JobSchema)
