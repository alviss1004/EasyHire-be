const express = require("express");
const router = express.Router();
const {
  register,
  getUsers,
  getUserById,
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
 * @route GET API/users
 * @description Get a list of users
 * @access private
 */
router.get("/", getUsers);

/**
 * @route GET api/users/:id
 * @description Get user by id
 * @access public
 */
router.get("/:id", getUserById);

//export
module.exports = router;
