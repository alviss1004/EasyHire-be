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
    rating: {
      type: Number,
      enum: [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
      require: true,
    },
    comment: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

//Create and export model
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
