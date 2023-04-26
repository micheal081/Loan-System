const mongoose = require("mongoose");

const connectDB = (url) => {
  return mongoose.connect(url, { useNewUrlParser: true });
  mongoose.set("useCreateIndex", true);
  mongoose.set("useFindAndModify", false);
};

module.exports = connectDB;
