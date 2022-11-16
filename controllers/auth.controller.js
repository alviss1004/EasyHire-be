const { sendResponse, AppError, catchAsync } = require("../helpers/utils.js");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const authController = {};

authController.loginWithEmail = catchAsync(async (req, res, next) => {
  //Get data from request
  const { email, password } = req.body;
  //Business Logic Validation
  const user = await User.findOne({ email }, "+password");
  if (!user) throw new AppError(400, "Invalid Credentials", "Login Error");

  //Process
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError(400, "Wrong password", "Login Error");
  const accessToken = await user.generateToken();

  //Response
  sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Login Successfully"
  );
});

module.exports = authController;
