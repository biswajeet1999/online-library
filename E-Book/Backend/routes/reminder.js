const router = require("express").Router();
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { setReminder, getReminders } = require("../controllers/reminder");
const { getUserById } = require("../controllers/user");

router.param("userId", getUserById);
router.post("/setreminder/:userId", isSignedIn, isAuthenticated, setReminder);
router.get("/getreminders/:userId", isSignedIn, isAuthenticated, getReminders);

module.exports = router;
