const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validators = require("../middlewares/validators.js");
const {} = require("../controllers/job.controller.js");

/**
 * @route GET /jobs?page=1&limit=10
 * @description Get job list with pagination with skills, industry query
 * @body
 * @access public
 */

/**
 * @route GET /jobs/:id
 * @description Get job detail
 * @body
 * @access login required
 */

/**
 * @route GET /jobs/:id/bids
 * @description Get all bids of a job
 * @body
 * @access login required
 */

/**
 * @route POST /jobs
 * @description List a new job
 * @body {title, industry, description, image}
 * @access login required
 */

/**
 * @route PUT /jobs/:id
 * @description Edit a listed job
 * @body {title, industry, description, image}
 * @access login required
 */

/**
 * @route DELETE /jobs/:id
 * @description Delete a job listing
 * @body
 * @access login required
 */

//export
module.exports = router;
