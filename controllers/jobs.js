const Job = require("../models/Job")
const Application = require("../models/Application")
const asyncWrapper = require("../middleware/async")
const {
  CustomAPIError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} = require("../errors")

const getAllJobs = asyncWrapper(async (req, res) => {
  let jobs

  if (req.user.role === "employee") {
    jobs = await Job.find()
  } else if (req.user.role === "employer") {
    jobs = await Job.find({ createdBy: req.user.userId })
  } else {
    throw new UnauthorizedError("Access Denied")
  }

  res.status(200).json({ count: jobs.length, jobs })
})

const getJob = asyncWrapper(async (req, res) => {
  const {
    user: { userId, role },
    params: { id: jobId },
  } = req

  if (role === "employer") {
    const job = await Job.findOne({
      _id: jobId,
      createdBy: userId,
    })

    if (!job) {
      throw new NotFoundError(`No job with id ${jobId}`)
    }

    res.status(200).json({ job })
  } else if (role === "employee") {
    const job = await Job.findById(jobId)
    res.status(200).json({ job })
  }
})

const createJob = asyncWrapper(async (req, res) => {
  if (req.user.role === "employer") {
    req.body.createdBy = req.user.userId
    const job = await Job.create(req.body)
    res.status(201).json({ job })
  } else {
    // request code
    throw new UnauthorizedError(
      `${req.user.name} ${req.user.role}  Access denied`
    )
  }
})

const updateJob = asyncWrapper(async (req, res) => {
  if (req.user.role === "employer") {
    const {
      body: { company, position },
      user: { userId },
      params: { id: jobId },
    } = req

    if (company === "" || position == "") {
      throw new BadRequestError("Company or Position fields cannot be empty")
    }

    const job = await Job.findByIdAndUpdate(
      { _id: jobId, createBy: userId },
      req.body,
      { new: true, runValidators: true }
    )
    res.status(200).json({ job })
  } else {
    throw new UnauthorizedError("Access denied")
  }
})

const deleteJob = asyncWrapper(async (req, res) => {
  if (req.user.role === "employer") {
    const {
      user: { userId },
      params: { id: jobId },
    } = req

    const job = await Job.findOneAndDelete({
      _id: jobId,
      createdBy: userId,
    })

    if (!job) {
      throw new NotFoundError(`No job with id ${jobId}`)
    }

    res.status(200).send({ job })
  } else {
    throw new UnauthorizedError("Access denied")
  }
})

const applyForJob = asyncWrapper(async (req, res) => {
  const { id: jobId } = req.params
  const { userId, role } = req.user // Assuming req.user contains authenticated user info
  const { resume, coverLetter } = req.body

  // Check if the user is an employee
  if (role !== "employee") {
    throw new UnauthorizedError("Only employees can apply for jobs")
  }

  // Check if the job exists
  const job = await Job.findById(jobId)
  if (!job) {
    throw new NotFoundError(`Job with id ${jobId} not found`)
  }

  // Validate resume and cover letter
  if (!resume || !coverLetter) {
    throw new BadRequestError("Resume and cover letter are required")
  }

  // Create the application
  const application = await Application.create({
    job: jobId,
    applicant: userId,
    resume,
    coverLetter,
  })

  // Respond with the created application
  res.status(201).json({ application })
})

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  applyForJob,
}
