const express = require("express")
const Application = require("../models/Application")
const asyncWrapper = require("../middleware/async")
const Job = require("../models/Job")
const {
  CustomAPIError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} = require("../errors")

const getAllApplication = asyncWrapper(async (req, res) => {
  const { role, userId } = req.user

  if (role === "employee") {
    // Get all applications where the applicant is the current user
    const applications = await Application.find({ applicant: userId }).populate(
      "job"
    ) // Assuming you want to include job details
    res.status(200).json({ count: applications.length, applications })
  } else if (role === "employer") {
    // Get all applications for jobs posted by the current employer
    const jobs = await Job.find({ createdBy: userId }).select("_id") // Get all job IDs for the employer
    const jobIds = jobs.map((job) => job._id) // Extract job IDs
    const applications = await Application.find({
      job: { $in: jobIds },
    }).populate("applicant") // Find applications for these jobs
    res.status(200).json({ count: applications.length, applications })
  } else {
    // Handle unauthorized role
    throw new UnauthorizedError("Access denied")
  }
})

const getApplication = asyncWrapper(async (req, res) => {
  const { role, userId } = req.user
  const { id: applicationId } = req.params

  let application

  if (role === "employee") {
    // Employee can only view their own applications
    application = await Application.findOne({
      _id: applicationId,
      applicant: userId,
    }).populate({ path: "applicant", select: "name email" })

    if (!application) {
      throw new NotFoundError(`No application with the id ${applicationId}`)
    }

    res.status(200).json({ application })
  } else if (role === "employer") {
    // Employer can only view applications for jobs they have posted
    application = await Application.findById(applicationId).populate("job")

    if (!application) {
      throw new NotFoundError(`No application with the id ${applicationId}`)
    }

    // Ensure the employer only sees applications for jobs they created
    if (application.job.createdBy.toString() !== userId) {
      throw new UnauthorizedError("Access denied to this application")
    }

    res.status(200).json({ application })
  } else {
    throw new UnauthorizedError("Invalid role")
  }
})

const updateApplicationStatus = asyncWrapper(async (req, res) => {
  const { id: applicationId } = req.params // Application ID from the URL
  const { status } = req.body // New status from the request body

  // Ensure the status is one of the allowed values
  const allowedStatuses = ["pending", "accepted", "rejected"]
  if (!allowedStatuses.includes(status)) {
    throw new CustomAPIError(400, "invalid status value")
  }

  // Find the application and update the status
  const application = await Application.findById(applicationId)

  // Ensure the application exists
  if (!application) {
    throw new NotFoundError(`No application with the id ${applicationId}`)
  }

  // (Optional) Check if the current user has permission to update the status
  // Assuming req.user is populated by authentication middleware
  const job = await Job.findById(application.job)
  if (job.createdBy.toString() !== req.user.userId) {
    throw new UnauthorizedError("Access denied")
  }

  // Update the application status
  application.status = status
  await application.save()
  await application.populate('job applicant')

  res.status(200).json({ message: "Application status updated", application })
})

const withdrawApplication = asyncWrapper(async (req, res) => {
  if (req.user.role !== "employee") {
    throw new UnauthorizedError("Acces denied")
  }

  const {
    user: { userId },
    params: { id: applicationId },
  } = req

  // Find the application and check ownership
  const application = await Application.findOneAndDelete({
    _id: applicationId,
    applicant: userId,
  })
  if (!application) {
    throw new NotFoundError(
      `No application found with id ${applicationId}`,
      404
    )
  }

  res.status(200).json({
    message: "Application withdrawn successfully",
    application,
  })
})

module.exports = {
  getAllApplication,
  updateApplicationStatus,
  withdrawApplication,
  getApplication,
}
