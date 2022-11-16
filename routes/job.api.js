const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const validators = require("../middlewares/validators.js");
const {
  getJobs,
  getJobDetail,
  getJobBids,
  createJob,
  updateJob,
  deleteJob,
} = require("../controllers/job.controller.js");
const authentication = require("../middlewares/authentication.js");

/**
 * @route GET /jobs?page=1&limit=10
 * @description Get job list with pagination and skills/industry in query (optional)
 * @body
 * @access public
 */
router.get("/", getJobs);

/**
 * @route GET /jobs/:id
 * @description Get job detail
 * @body
 * @access login required
 */
router.get(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  getJobDetail
);

/**
 * @route GET /jobs/:id/bids
 * @description Get all bids of a job
 * @body
 * @access login required
 */
router.get(
  "/:id/bids",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  getJobBids
);

/**
 * @route POST /jobs
 * @description List a new job
 * @body {title, industry, description, skills, image}
 * @access login required
 */
router.post(
  "/",
  authentication.loginRequired,
  validators.validate([
    body("title", "Invalid title").exists().notEmpty(),
    body("industry", "Invalid industry").exists().notEmpty(),
    body("description", "Invalid description").exists().notEmpty(),
  ]),
  createJob
);

/**
 * @route PUT /jobs/:id
 * @description Edit a listed job
 * @body {title, industry, description, skills, image}
 * @access login required
 */
router.put(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  updateJob
);

/**
 * @route DELETE /jobs/:id
 * @description Delete a job listing
 * @body
 * @access login required
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  deleteJob
);

//export
module.exports = router;
