const mongoose = require("mongoose");
//Create schema
const bidSchema = mongoose.Schema(
  {},
  {
    timestamps: true,
  }
);

//Create and export model
const Bid = mongoose.model("Bid", bidSchema);
module.exports = Bid;
