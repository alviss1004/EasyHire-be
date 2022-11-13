const mongoose = require("mongoose");
//Create schema
const reviewSchema = mongoose.Schema(
  {},
  {
    timestamps: true,
  }
);

//Create and export model
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
