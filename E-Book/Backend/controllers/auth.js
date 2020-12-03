const User = require("../models/User");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

exports.signUp = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errList = errors.errors.map((err) => err.msg);
    return res.status(400).json({ err: errList });
  }

  const { name, email, password, role } = req.body;
  const user = new User({ name, email, role, plainPassword: password });
  user.save((err, user) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ err: ["Unable to create User"] });
    }
    return res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
};

exports.signIn = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errList = errors.errors.map((err) => err.msg);
    return res.status(400).json({ err: errList });
  }

  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err) {
      return res.status(401).json({ err: ["Some error occured"] });
    }

    if (!user) {
      return res.status(401).json({ err: ["Invallid Email"] });
    }

    if (user.encrypt(password) !== user.password) {
      return res.status(401).json({ err: ["Invallid Password"] });
    }
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    res.cookie("token", token, { expire: new Date() + 99999 });
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
};

exports.signOut = (req, res) => {
  res.clearCookie("token");
  res.json({ msg: "signout successfully" });
};

// protected middlewares
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  algorithms: ["HS256"],
  requestProperty: "auth",
});

exports.isAuthenticated = (req, res, next) => {
  if (req.profile && req.auth && req.auth._id.toString() === req.profile._id.toString()) {
    return next();
  }
  return res.status(403).json({ err: ["Access Denied"] });
};

exports.isAdmin = (req, res, next) => {
  if (req.profile && req.profile.role === 0) {
    return next();
  }
  return res.status(403).json({ err: ["only Admin is Allowed"] });
};
