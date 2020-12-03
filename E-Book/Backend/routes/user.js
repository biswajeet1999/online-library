const router = require("express").Router();

const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const {
  getUserById,
  getToken,
  // processPayment,
  purchaseBook,
  getPurchasedBooks,
  updateNote,
  getNote,
  getAdminHomeInfo,
} = require("../controllers/user");
const { getBookById } = require("../controllers/book");

router.param("userId", getUserById);
router.param("bookId", getBookById);

router.get("/admin/getHomeInfo/:userId", isSignedIn, isAuthenticated, isAdmin, getAdminHomeInfo);

router.get("/books/library/:userId", isSignedIn, isAuthenticated, getPurchasedBooks);
router.put("/book/updatenote/:purchasedBookId/:userId", isSignedIn, isAuthenticated, updateNote);
router.get("/book/getnote/:purchasedBookId/:userId", isSignedIn, isAuthenticated, getNote);
// payment routes
router.get("/payment/gettoken/:userId", isSignedIn, isAuthenticated, getToken);
// router.post("/payment/braintree/:userId", isSignedIn, isAuthenticated, processPayment);
router.post("/book/purchase/:bookId/:userId", isSignedIn, isAuthenticated, purchaseBook);

module.exports = router;
