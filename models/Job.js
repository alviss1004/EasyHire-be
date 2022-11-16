const mongoose = require("mongoose");
//Create schema
const jobSchema = mongoose.Schema(
  {
    lister: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "User",
    },
    title: { type: String, require: true },
    industry: { type: String, require: true },
    description: { type: String, require: true },
    imageUrl: { type: String, require: false, default: "" },
    status: {
      type: String,
      enum: ["bidding", "ongoing", "finished"],
      default: "bidding",
      require: true,
    },
    assignee: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    reviews: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Review" }],

    isDeleted: { type: Boolean, default: false, select: false },

    bidCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

//Create and export model
const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
