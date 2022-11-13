const express = require("express");
const router = express.Router();
const {
  register,
  getUsers,
  getUserById,
} = require("../controllers/user.controller.js");

/**
 * @route GET API/users
 * @description Get a list of users
 * @access private
 */
router.get("/", getUsers);

/**
 * @route POST /users
 * @description Register for a new user
 * @body {name, email, password}
 * @access public
 */
router.post("/", register);

/**
 * @route GET api/users/:id
 * @description Get user by id
 * @access public
 */
router.get("/:id", getUserById);

//export
module.exports = router;
