const router = require("express").Router();

const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const {
  getCategoryById,
  createCategory,
  removeCategory,
  updateCategory,
  getAllCategory,
  getCategory,
} = require("../controllers/category");
const { getUserById } = require("../controllers/user");

router.param("userId", getUserById);
router.param("categoryId", getCategoryById);

//admin protected routes
router.post("/category/create/:userId", isSignedIn, isAuthenticated, isAdmin, createCategory);
router.delete(
  "/category/remove/:categoryId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  removeCategory
);

router.put(
  "/category/update/:categoryId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateCategory
);

router.get("/category/all", isSignedIn, getAllCategory);
router.get("/category/get/:categoryId", isSignedIn, getCategory);

module.exports = router;
