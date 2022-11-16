const { sendResponse, AppError, catchAsync } = require("../helpers/utils.js");
const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const userController = {};

userController.register = catchAsync(async (req, res, next) => {
  //Get data from request
  let { name, email, password } = req.body;
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
  return sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Create user successfully"
  );
});

userController.getFreelancers = catchAsync(async (req, res, next) => {
  //Get data from request
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  //Business Logic Validation & Process
  const count = await User.countDocuments({ isFreelancer: true });
  const offset = limit * (page - 1);
  const totalPages = Math.ceil(count / limit);

  let freelancers = await User.find({ isFreelancer: true })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);
  if (!freelancers)
    throw new AppError(400, "No freelancer found", "Get freelancers error");

  //Response
  return sendResponse(
    res,
    200,
    true,
    { freelancers, totalPages, count },
    null,
    "Get freelancers successfully"
  );
});

userController.getMyProfile = catchAsync(async (req, res, next) => {
  //Get data from request
  const currentUserId = req.userId;
  //Business Logic Validation
  const user = await User.findById(currentUserId);
  if (!user)
    throw new AppError(400, "User not found", "Get current user error");

  //Response
  return sendResponse(
    res,
    200,
    true,
    { user },
    null,
    "Get current user successfully"
  );
});

userController.getSingleUser = catchAsync(async (req, res, next) => {
  //Get data from request
  const userId = req.params.id;
  //Business Logic Validation
  const user = await User.findById(userId);
  if (!user) throw new AppError(400, "User not found", "Get single user error");

  //Response
  return sendResponse(
    res,
    200,
    true,
    { user },
    null,
    "Get single user successfully"
  );
});

userController.getCurrentUserBids = catchAsync(async (req, res, next) => {
  //Get data from request
  const currentUserId = req.userId;
  //Business Logic Validation
  const user = await User.findById(currentUserId);
  if (!user) throw new AppError(400, "User not found", "Get User Bids Error");

  const userBids = user.bids;

  //Response
  return sendResponse(
    res,
    200,
    true,
    { userBids },
    null,
    "Get user bids successfully"
  );
});

userController.updateProfile = catchAsync(async (req, res, next) => {
  //Get data from request
  const currentUserId = req.userId;
  const userId = req.params.id;
  //Business Logic Validation
  if (currentUserId !== userId)
    throw new AppError(400, "Permission required", "Update User Error");
  let user = await User.findById(userId);
  if (!user) throw new AppError(400, "User not found", "Update User Error");
  //Process
  const allows = [
    "isFreelancer",
    "avatarUrl",
    "aboutMe",
    "company",
    "industry",
    "skills",
  ];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });
  await user.save();
  //Response
  return sendResponse(
    res,
    200,
    true,
    { user },
    null,
    "Update profile successfully"
  );
});

userController.deleteUser = catchAsync(async (req, res, next) => {
  //Get data from request
  const currentUserId = req.userId;
  const userId = req.params.id;
  //Business Logic Validation
  let user = await User.findOneAndUpdate(
    { _id: currentUserId },
    { isDeleted: true },
    { new: true }
  );

  if (!user)
    throw new AppError(
      400,
      "User not found or User is not authorized",
      "Delete User Error"
    );

  //Response
  return sendResponse(
    res,
    200,
    true,
    { user },
    null,
    "Delete user successfully"
  );
});

module.exports = userController;
