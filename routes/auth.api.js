const express = require("express");
const router = express.Router();
const { loginWithEmail } = require("../controllers/auth.controller.js");
const { body } = require("express-validator");
const validators = require("../middlewares/validators.js");

/**
 * @route POST /auth/login
 * @description Login with email and password
 * @body {email, password}
 * @access public
 */
router.post(
  "/login",
  validators.validate([
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  loginWithEmail
);

//export
module.exports = router;
