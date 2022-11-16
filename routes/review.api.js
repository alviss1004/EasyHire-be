const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const validators = require("../middlewares/validators.js");
const authentication = require("../middlewares/authentication.js");
const {
  getUserReviews,
  createReview,
} = require("../controllers/review.controller.js");

/**
 * @route POST /reviews/:jobId
 * @description Write a review for a user
 * @body {rating, comment}
 * @access login required
 */
router.post(
  "/:jobId",
  authentication.loginRequired,
  validators.validate([body("rating", "Invalid rating").exists().notEmpty()]),
  validators.validate([
    param("jobId").exists().isString().custom(validators.checkObjectId),
  ]),
  createReview
);

//export
module.exports = router;
