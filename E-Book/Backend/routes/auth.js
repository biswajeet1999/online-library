const router = require("express").Router();
const { check } = require("express-validator");
const { signUp, signIn, signOut, isSignedIn } = require("../controllers/auth");

router.post(
  "/signup",
  [
    check("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name length must be atleast 2"),
    check("email").trim().isEmail().withMessage("Email must be valid"),
    check("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password length must be atleast 5"),
  ],
  signUp
);

router.post(
  "/signin",
  [
    check("email").trim().isEmail().withMessage("Email must be valid"),
    check("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password length must be atleast 5"),
  ],
  signIn
);

router.get("/signout", signOut);

module.exports = router;
