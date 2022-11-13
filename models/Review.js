const mongoose = require("mongoose");
//Create schema
const reviewSchema = mongoose.Schema(
  {
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    targetJob: { type: mongoose.SchemaTypes.ObjectId, ref: "Job" },
    rating: { type: Number, require: true },
    comment: { type: String, require: false, default: "" },
  },
  {
    timestamps: true,
  }
);

//Create and export model
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
