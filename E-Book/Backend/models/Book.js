const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const BookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 100,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    category: {
      type: ObjectId,
      ref: "BookCategory",
      required: true,
    },
    pdf: {
      data: Buffer,
      contentType: String,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
      default: 0,
    },
    readerCount: {
      type: Number,
      required: true,
      trim: true,
      default: 0,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", BookSchema);

module.exports = Book;
