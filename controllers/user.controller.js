const { sendResponse, AppError } = require("../helpers/utils.js");
const mongoose = require("mongoose");
var ObjectId = require("mongoose").Types.ObjectId;
const User = require("../models/User");

const userController = {};

userController.register = async (req, res, next) => {
  //Get data from request
  const { name, email, password } = req.body;
  //Process

  //Response
  sendResponse(
    res,
    200,
    true,
    { name, email, password },
    null,
    "Create user successfully"
  );
};

module.exports = userController;
