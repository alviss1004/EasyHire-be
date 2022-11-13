const mongoose = require("mongoose");
//Create schema
const jobSchema = mongoose.Schema(
  {
    isDeleted: { type: Boolean, default: false, select: false },
  },
  {
    timestamps: true,
  }
);

//Create and export model
const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
