const { sendResponse, AppError, catchAsync } = require("../helpers/utils.js");
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Job = require("../models/Job");

const commentController = {};

commentController.createComment = catchAsync(async (req, res, next) => {
  //Get data from request
  const { content } = req.body;
  const currentUserId = req.userId;
  const targetJobId = req.params.jobId;
  //Check if job exists
  let targetJob = await Job.findById(targetJobId);
  if (!targetJob)
    throw new AppError(400, "No job found", "Create Comment Error");
  //Create comment after validation
  let comment = await Comment.create({
    author: currentUserId,
    targetJob: targetJobId,
    content,
  });

  //Response
  return sendResponse(
    res,
    200,
    true,
    { comment },
    null,
    "Create comment successfully"
  );
});

commentController.getJobComments = catchAsync(async (req, res, next) => {
  //Get data from request
  const targetJobId = req.params.jobId;
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  //Business Logic Validation & Process
  const count = await Comment.countDocuments({ targetJob: targetJobId });
  const offset = limit * (page - 1);
  const totalPages = Math.ceil(count / limit);

  let comments = await Comment.find({ targetJob: targetJobId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author");
  if (!comments)
    throw new AppError(400, "No comment found", "Get Job Comments Error");

  //Response
  return sendResponse(
    res,
    200,
    true,
    { comments },
    null,
    "Get job comments successfully"
  );
});

commentController.deleteComment = catchAsync(async (req, res, next) => {
  //Get data from request
  const currentUserId = req.userId;
  const commentId = req.params.id;
  //Business Logic Validation
  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    author: currentUserId,
  });
  if (!comment)
    throw new AppError(
      400,
      "Comment not found or User is not authorized",
      "Delete Comment Error"
    );

  //Response
  return sendResponse(
    res,
    200,
    true,
    { comment },
    null,
    "Delete comment successfully"
  );
});

module.exports = commentController;
