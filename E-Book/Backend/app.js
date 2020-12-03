// core modules
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// user defined modules
const authRoute = require("./routes/auth");
const categoryRoute = require("./routes/category");
const bookRoute = require("./routes/book");
const userRoute = require("./routes/user");
const reminderRoute = require("./routes/reminder");

const app = express();

// middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Database Connected...");
  })
  .catch(() => {
    console.log("Unable to connect Database");
  });

// routes
app.use("/", authRoute);
app.use("/", categoryRoute);
app.use("/", bookRoute);
app.use("/", userRoute);
app.use("/", reminderRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Started at ${PORT}`);
});
