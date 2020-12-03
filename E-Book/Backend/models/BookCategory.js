const mongoose = require("mongoose");

const BookcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    // no of users downloaded different books of this category
    count: {
      type: Number,
      trim: true,
      required: true,
      default: 0,
    },
    // no of books added to this category
    noOfBooks: {
      type: Number,
      trom: true,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

const BookCategory = mongoose.model("BookCategory", BookcategorySchema);

module.exports = BookCategory;
