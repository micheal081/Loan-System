const express = require("express");
const app = express();
const loan = require("./routes/loan");
const connectDB = require("./db/connect");
require("dotenv").config();
const notFound = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const cors = require("cors");

app.use(cors());

// For accepting post form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions handler
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "mySessions",
});

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 4 * 60 * 60 * 1000 }, // 1 minute
    store: store,
  })
);

// static Files
app.use(express.static("public"));

// Set Templating Engine
app.set("view engine", "ejs");

//routes
app.use("/api/v1/loan", loan);
app.use(notFound);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`Server is listening on ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
