const express = require("express");
const router = express.Router();
const {
  register,
  getFreelancers,
} = require("../controllers/user.controller.js");
const { body } = require("express-validator");
const validators = require("../middlewares/validators.js");

/**
 * @route POST /users
 * @description Register for a new user
 * @body {name, email, password}
 * @access public
 */
router.post(
  "/",
  validators.validate([
    body("name", "Invalid name").exists().notEmpty(),
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  register
);

/**
 * @route GET /users/freelancers
 * @description Get all users with the freelancer role
 * @body
 * @access public
 */
router.get("/freelancers", getFreelancers);

/**
 * @route GET /users/me
 * @description Get current user profile
 * @body
 * @access login required
 */

/**
 * @route GET /users/:id
 * @description Get profile of a user
 * @body
 * @access login required
 */

/**
 * @route GET /users/:id/bids
 * @description Get all bids of current user
 * @body
 * @access login required
 */

/**
 * @route PUT /users/:id
 * @description Update user profile
 * @body {name, role, industry, company, skills, avatarUrl, about me}
 * @access login required
 */

//export
module.exports = router;
