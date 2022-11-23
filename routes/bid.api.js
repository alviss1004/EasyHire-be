const express = require("express");
const router = express.Router();
const {
  createBid,
  acceptBid,
  declineBid,
  deleteBid,
} = require("../controllers/bid.controller.js");
const { body, param } = require("express-validator");
const validators = require("../middlewares/validators.js");
const authentication = require("../middlewares/authentication.js");

/**
 * @route POST /bids/:jobId
 * @description Bid for a job
 * @body {price}
 * @access login required
 */
router.post(
  "/:jobId",
  authentication.loginRequired,
  validators.validate([body("price", "Invalid price").exists().notEmpty()]),
  validators.validate([
    param("jobId").exists().isString().custom(validators.checkObjectId),
  ]),
  createBid
);

/**
 * @route PUT /bids/accept/:id
 * @description Accept a bid
 * @body
 * @access login required
 */
router.put(
  "/accept/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  acceptBid
);

/**
 * @route DELETE /bids/decline/:id
 * @description Decline a bid
 * @body
 * @access login required
 */
router.delete(
  "/decline/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  declineBid
);

/**
 * @route DELETE /bids/:id
 * @description Delete a bid
 * @body
 * @access login required
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  deleteBid
);

//export
module.exports = router;
