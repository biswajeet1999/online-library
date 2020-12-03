const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");
const { ObjectId } = mongoose.Schema;
const crypto = require("crypto");

// role 1: user
// role 0: admin
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      minLength: 9,
      unique: true,
      trim: true,
    },
    salt: String,
    // encrypted password
    password: {
      type: String,
      required: true,
      minLength: 5,
    },
    role: {
      type: Number,
      required: true,
      default: 1,
    },
    purchasedList: [
      {
        bookId: {
          type: ObjectId,
          ref: "Book",
        },
        notes: {
          type: String,
          default: "",
        },
      },
    ],
    todo: [
      {
        date: {
          type: String,
          required: true,
          trim: true,
        },
        task: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    isBlocked: {
      type: Boolean,
      required: true,
      trim: true,
      default: false,
    },
    resetPasswordInterval: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

UserSchema.methods = {
  encrypt: function (plainPassword) {
    if (!plainPassword) return "";
    try {
      return crypto.createHmac("sha256", this.salt).update(plainPassword).digest("hex");
    } catch (err) {
      console.log(err);

      return "";
    }
  },
};

UserSchema.virtual("plainPassword").set(function (password) {
  this.salt = uuid();
  this.password = this.encrypt(password);
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
