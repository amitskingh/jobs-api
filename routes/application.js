const express = require("express")
const router = express.Router()

const {
  getAllApplication,
  updateApplicationStatus,
  withdrawApplication,
  getApplication,
} = require("../controllers/application")

router.route("/").get(getAllApplication)
router.route("/:id").get(getApplication).delete(withdrawApplication)

router.route("/:id/status").put(updateApplicationStatus)

module.exports = router
