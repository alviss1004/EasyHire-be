const { sendResponse, AppError, catchAsync } = require("../helpers/utils.js");
const mongoose = require("mongoose");
var ObjectId = require("mongoose").Types.ObjectId;
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const userController = {};

userController.register = catchAsync(async (req, res, next) => {
  //Get data from request
  const { name, email, password } = req.body;
  //Business Logic Validation
  let user = await User.findOne({ email });
  if (user)
    throw new AppError(400, "User already exists", "Registration Error");

  //Process
  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  user = await User.create({ name, email, password });
  const accessToken = await user.generateToken();

  //Response
  sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Create user successfully"
  );
});

module.exports = userController;
