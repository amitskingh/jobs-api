const mongoose = require("mongoose")

const ApplicationSchema = mongoose.Schema(
  {
    job: {
      type: mongoose.Types.ObjectId,
      ref: "Job",
      required: [true, "Please provide jobId"],
    },
    applicant: { 
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide the userId"],
    },
    resume: {
      type: String, // Link to the resume file
      required: [true, "Please provide the resume link"],
    },
    coverLetter: {
      type: String,
      maxlength: 2000, // Limiting the length of the cover letter
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    appliedAt: {
      // Renamed from applieDate for clarity
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
) // Automatically manages createdAt and updatedAt fields

module.exports = mongoose.model("Application", ApplicationSchema)
