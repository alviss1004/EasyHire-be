const { sendResponse, AppError, catchAsync } = require("../helpers/utils.js");
const mongoose = require("mongoose");
const User = require("../models/User");
const Job = require("../models/Job");
const Bid = require("../models/Bid");
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

  let freelancers = await User.find({ isFreelancer: true, isDeleted: false })
    .skip(offset)
    .limit(limit)
    .populate({ path: "reviews", populate: { path: "author" } });
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

userController.getFeaturedFreelancers = catchAsync(async (req, res, next) => {
  //Business Logic Validation & Process
  let freelancers = await User.find({ isFreelancer: true, isDeleted: false })
    .limit(10)
    .sort({ rating: -1 });
  if (!freelancers)
    throw new AppError(
      400,
      "No freelancer found",
      "Get featured freelancers error"
    );

  //Response
  return sendResponse(
    res,
    200,
    true,
    { freelancers },
    null,
    "Get featured freelancers successfully"
  );
});

userController.getMyProfile = catchAsync(async (req, res, next) => {
  //Get data from request
  const currentUserId = req.userId;
  //Business Logic Validation
  const user = await User.findById(currentUserId).populate({
    path: "reviews",
    populate: { path: "author" },
  });
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
  const user = await User.findById(userId).populate({
    path: "reviews",
    populate: { path: "author" },
  });
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

userController.getUserBids = catchAsync(async (req, res, next) => {
  //Get data from request
  const currentUserId = req.userId;
  //Business Logic Validation
  const myBids = await Bid.find({ bidder: currentUserId })
    .populate("targetJob")
    .sort({ status: -1, createdAt: -1 });
  if (!myBids) throw new AppError(400, "No bids found", "Get User Bids Error");

  //Response
  return sendResponse(
    res,
    200,
    true,
    { myBids },
    null,
    "Get user bids successfully"
  );
});

userController.getUserJobListings = catchAsync(async (req, res, next) => {
  //Get data from request
  const currentUserId = req.userId;
  const jobStatus = req.query.status;
  //Business Logic Validation
  const filterConditions = [{ isDeleted: false, lister: currentUserId }];
  //Check for status query
  if (jobStatus) {
    filterConditions.push({
      status: { $regex: jobStatus, $options: "i" },
    });
  }

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const myJobs = await Job.find(filterCriteria).sort({
    createdAt: -1,
  });
  if (!myJobs)
    throw new AppError(400, "No jobs found", "Get User Job Listings Error");

  //Response
  return sendResponse(
    res,
    200,
    true,
    { myJobs },
    null,
    "Get user job listings successfully"
  );
});

userController.getUserAssignedJobs = catchAsync(async (req, res, next) => {
  //Get data from request
  const currentUserId = req.userId;
  //Business Logic Validation
  const assignedJobs = await Job.find({
    isDeleted: false,
    assignee: currentUserId,
  })
    .sort({ createdAt: -1 })
    .populate("lister")
    .populate("bids")
    .populate("review");
  if (!assignedJobs)
    throw new AppError(400, "No jobs found", "Get User Assigned Jobs Error");

  //Response
  return sendResponse(
    res,
    200,
    true,
    { assignedJobs },
    null,
    "Get user assigned jobs successfully"
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
    "name",
    "isFreelancer",
    "avatarUrl",
    "aboutMe",
    "company",
    "industry",
    "jobTitle",
    "facebookLink",
    "instagramLink",
    "linkedinLink",
    "twitterLink",
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
