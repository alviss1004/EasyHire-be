const mongoose = require("mongoose");
//Create schema
const commentSchema = mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    content: { type: String, required: true },
    reply: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

//Create and export model
const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
