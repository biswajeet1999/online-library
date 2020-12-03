const braintree = require("braintree");

const User = require("../models/User");
const Book = require("../models/Book");
const BookCategory = require("../models/BookCategory");

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: "x6765kps8ytdy66p",
  publicKey: "py48r9m4fttrps6v",
  privateKey: "d9081cd5e669e5d1ab0eb99524313545",
});

exports.getUserById = (req, res, next, id) => {
  User.findById(id)
    .populate("purchasedList.bookId")
    .exec((err, user) => {
      if (err) {
        return res.status(400).json({ err: "User not found" });
      }
      if (!user) {
        return res.status(400).json({ err: "No user found" });
      }
      req.profile = user;
      next();
    });
};

const getTotalUsers = () => {
  return new Promise((resolve, reject) => {
    User.find({}).then((users) => resolve(users.length));
  });
};
const getTotalCategories = () => {
  return new Promise((resolve, reject) => {
    BookCategory.find({}).then((categories) => resolve(categories.length));
  });
};
const getTotalBooks = () => {
  return new Promise((resolve, reject) => {
    Book.find({}).then((books) => resolve(books.length));
  });
};
// const getTotalBlockedUsers = () => {};

exports.getAdminHomeInfo = async (req, res) => {
  return res.status(200).json({
    noOfUsers: await getTotalUsers(),
    noOfBooks: await getTotalBooks(),
    noOfCategories: await getTotalCategories(),
    // blockedUsers: await getTotalBlockedUsers()
  });
};

exports.getToken = (req, res) => {
  gateway.clientToken.generate({}, (err, response) => {
    if (err) {
      return res.status(400).send(err);
    }
    // client token is inside response object
    res.status(200).send(response);
  });
};

// exports.processPayment = (req, res) => {
//   const nonceFromTheClient = req.body.paymentMethodNonce;
//   const amountFromTheClient = req.body.price;

//   gateway.transaction.sale(
//     {
//       amount: amountFromTheClient,
//       paymentMethodNonce: nonceFromTheClient,
//       options: {
//         submitForSettlement: true,
//       },
//     },
//     (err, result) => {
//       if (err) {
//         return res.status(500).json({ err });
//       }
//       return res.status(200).json({ result });
//     }
//   );
// };

const processPayment = (req) => {
  return new Promise((resolve, reject) => {
    const nonceFromTheClient = req.body.paymentMethodNonce;
    const amountFromTheClient = req.body.price;

    gateway.transaction.sale(
      {
        amount: amountFromTheClient,
        paymentMethodNonce: nonceFromTheClient,
        options: {
          submitForSettlement: true,
        },
      },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

exports.purchaseBook = async (req, res) => {
  const { book } = req;
  const user = req.profile;

  if (book.price !== 0) {
    try {
      const processPaymentResponse = await processPayment(req);
      // console.log(processPaymentResponse);
      if (!processPaymentResponse.success) {
        return res.status(400).json({ err: processPaymentResponse.message });
      }
    } catch (err) {
      return res.status(400).json({ err: "Unable to process payment" });
    }
  }

  // increment reader count of the book
  book.readerCount += 1;
  book.save((err) => {
    if (err) {
      return res.status(400).json({ err: "Unable to increment reader count of the book" });
    } else {
      // increment category demand
      BookCategory.findByIdAndUpdate(
        book.category,
        { $inc: { count: 1 } },
        { useFindAndModify: false },
        (err, category) => {
          if (err) {
            return res.status(400).json({ err: "Unable to update category demand" });
          } else {
            // add book to the user library
            user.purchasedList.push({ bookId: book._id, notes: "" });
            user.save((err) => {
              if (err) {
                return res.status(400).json({ err: "Unable to add book to user's library" });
              } else {
                return res.status(200).json({ msg: "Book added to your library" });
              }
            });
          }
        }
      );
    }
  });
};

// exports.purchaseBook = (req, res) => {
//   const { book } = req;
//   const user = req.profile;

//   if (book.price !== 0) {
//     //TODO: handle payment gateway
//     return res.status(400).json({ err: "you need to purchase" });
//   }

//   // increment reader count of the book
//   book.readerCount += 1;
//   book.save((err) => {
//     if (err) {
//       return res.status(400).json({ err: "Unable to increment reader count of the book" });
//     } else {
//       // increment category demand
//       BookCategory.findByIdAndUpdate(
//         book.category,
//         { $inc: { count: 1 } },
//         { useFindAndModify: false },
//         (err, category) => {
//           if (err) {
//             return res.status(400).json({ err: "Unable to update category demand" });
//           } else {
//             // add book to the user library
//             user.purchasedList.push({ bookId: book._id, notes: "" });
//             user.save((err) => {
//               if (err) {
//                 return res.status(400).json({ err: "Unable to add book to user's library" });
//               } else {
//                 return res.status(200).json({ msg: "Book added to your library" });
//               }
//             });
//           }
//         }
//       );
//     }
//   });
// };

exports.getPurchasedBooks = (req, res) => {
  let bookList = req.profile.purchasedList;
  for (let i = 0; i < bookList.length; i++) {
    bookList[i].bookId.pdf = undefined;
    bookList[i].bookId.photo = undefined;
  }
  return res.status(200).json({ msg: bookList });
};

exports.updateNote = (req, res) => {
  const { notes } = req.body;
  const user = req.profile;
  const { purchasedBookId } = req.params;

  for (let i = 0; i < user.purchasedList.length; i++) {
    if (user.purchasedList[i]._id.toString() === purchasedBookId.toString()) {
      user.purchasedList[i].notes = notes;
      break;
    }
  }
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({ err: "Unable to save note" });
    }
    return res.status(200).json({ msg: "note saved successfully" });
  });
};

exports.getNote = (req, res) => {
  const user = req.profile;
  const { purchasedBookId } = req.params;
  for (let i = 0; i < user.purchasedList.length; i++) {
    if (user.purchasedList[i]._id.toString() === purchasedBookId) {
      return res.status(200).json({ msg: user.purchasedList[i].notes });
    }
  }
  return res.status(400).json({ err: "Unable to find the note" });
};

// TODO: Handle isBlocked functionality i.e block a user, delete a user, get all blocked users, get all users
// isBlocked(boolean) attribute is added to the user model
