const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

// category demand collection will be created when admin add a new category to the database
const CategoryDemandSchema = new mongoose.Schema({
  category: {
    type: ObjectId,
    ref: "BookCategory",
    required: true,
  },
  downloaded: {
    type: Number,
    required: true,
    default: 0,
  },
});

const CategoryDemand = mongoose.model("CategoryDemand", CategoryDemandSchema);

module.exports = CategoryDemand;
