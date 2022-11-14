const express = require("express");
const router = express.Router();
const {} = require("../controllers/bid.controller.js");
const { body } = require("express-validator");
const validators = require("../middlewares/validators.js");

/**
 * @route POST /bids/:jobId
 * @description Bid for a job
 * @body {price}
 * @access login required
 */

/**
 * @route PUT /bids/:id
 * @description Update a bid
 * @body {price}
 * @access login required
 */

/**
 * @route DELETE /bids/:id
 * @description Delete a bid
 * @body {status}
 * @access login required
 */

//export
module.exports = router;
