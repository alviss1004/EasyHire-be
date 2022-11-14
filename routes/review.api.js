const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validators = require("../middlewares/validators.js");
const {} = require("../controllers/review.controller.js");

/**
 * @route GET /reviews/:userId
 * @description Get all reviews of a user
 * @body
 * @access login required
 */

/**
 * @route POST /reviews/:jobId
 * @description Write a review for a user
 * @body {rating, comment}
 * @access login required
 */

//export
module.exports = router;
