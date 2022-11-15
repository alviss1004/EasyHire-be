const express = require("express");
const router = express.Router();
const {
  register,
  getFreelancers,
  getMyProfile,
  getSingleUser,
  getCurrentUserBids,
  updateProfile,
} = require("../controllers/user.controller.js");
const { body, param } = require("express-validator");
const validators = require("../middlewares/validators.js");
const authentication = require("../middlewares/authentication.js");

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
 * @route GET /users/freelancers?page=1&limit=10
 * @description Get all users with the freelancer role with pagination
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
router.get("/me", authentication.loginRequired, getMyProfile);

/**
 * @route GET /users/:id
 * @description Get profile of a user
 * @body
 * @access login required
 */
router.get(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  getSingleUser
);

/**
 * @route GET /users/me/bids
 * @description Get all bids of current user
 * @body
 * @access login required
 */
router.get(
  "/me/bids",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  getCurrentUserBids
);

/**
 * @route PUT /users/:id
 * @description Update user profile
 * @body {name, isFreelancer, industry, company, skills, avatarUrl, about me}
 * @access login required
 */
router.put(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  updateProfile
);

//export
module.exports = router;
