const mongoose = require("mongoose");
//Create schema
const reviewSchema = mongoose.Schema(
  {
    author: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "User",
    },
    targetJob: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "Job",
    },
    rating: { type: Number, enum: [1, 2, 3, 4, 5], require: true },
    comment: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

//Create and export model
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
