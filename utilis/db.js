const mongoose = require("mongoose");

const URL = process.env.MONGODB_CON;

const connectionToMongo = async () => {
  try {
    await mongoose.connect(URL);
    console.log("database connected");
  } catch (error) {
    console.error("database error");
    process.exit(1);
  }
};


module.exports = connectionToMongo;
