const router = require("express").Router();
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");
const {
  createBook,
  deleteBook,
  updateBook,
  getBookById,
  getAllBooks,
  getAllBooksByCategory,
  getAllBooksByAuthor,
  getAllBooksByTitle,
  getAllBooksByPrice,
  getBook,
  getBookPhoto,
  getBookPdf,
} = require("../controllers/book");

router.param("userId", getUserById);
router.param("bookId", getBookById);

router.post("/book/create/:userId", isSignedIn, isAuthenticated, isAdmin, createBook);

router.delete("/book/delete/:bookId/:userId", isSignedIn, isAuthenticated, isAdmin, deleteBook);

router.put("/book/update/:bookId/:userId", isSignedIn, isAuthenticated, isAdmin, updateBook);

router.post("/book/getallbooks/:skip/:limit/:userId", isSignedIn, isAuthenticated, getAllBooks);

router.get("/book/get/:bookId/:userId", isSignedIn, isAuthenticated, getBook);

// router.get(
//   "/book/getallbooksbycategory/:categoryId/:userId",
//   isSignedIn,
//   isAuthenticated,
//   getAllBooksByCategory
// );

// router.get(
//   "/book/getallbooksbyauthor/:author/:userId",
//   isSignedIn,
//   isAuthenticated,
//   getAllBooksByAuthor
// );

// router.get(
//   "/book/getallbooksbytitle/:title/:userId",
//   isSignedIn,
//   isAuthenticated,
//   getAllBooksByTitle
// );

// router.get(
//   "/book/getallbooksbyprice/:price/:userId",
//   isSignedIn,
//   isAuthenticated,
//   getAllBooksByPrice
// );

router.get("/book/photo/:bookId", getBookPhoto);
router.get("/book/pdf/:bookId", getBookPdf);

module.exports = router;
