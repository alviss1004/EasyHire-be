const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const validators = require("../middlewares/validators.js");
const authentication = require("../middlewares/authentication.js");
const {
  createComment,
  getJobComments,
  updateComment,
  deleteComment,
} = require("../controllers/comment.controller.js");

/**
 * @route POST /comments/:jobId
 * @description Comment on a job
 * @body {content}
 * @access login required
 */
router.post(
  "/:jobId",
  authentication.loginRequired,
  validators.validate([body("content", "Invalid content").exists().notEmpty()]),
  validators.validate([
    param("jobId").exists().isString().custom(validators.checkObjectId),
  ]),
  createComment
);

/**
 * @route GET /comments/:jobId?page=1&limit=10
 * @description Get comment list of a job with pagination
 * @body
 * @access public
 */
router.get(
  "/:jobId",
  authentication.loginRequired,
  validators.validate([
    param("jobId").exists().isString().custom(validators.checkObjectId),
  ]),
  getJobComments
);

/**
 * @route PUT /comments/:id
 * @description Update a comment
 * @body {content}
 * @access login required
 */
router.put(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  updateComment
);

/**
 * @route DELETE /comments/:id
 * @description Delete a comment
 * @body
 * @access login required
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  deleteComment
);

//export
module.exports = router;
