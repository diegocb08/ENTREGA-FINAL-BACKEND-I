const mongoose = require("mongoose");

async function connectDB(uri) {
  if (!uri) {
    throw new Error("MONGODB_URI no está definido en .env");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DBNAME || "ecommerce",
  });
  console.log("MongoDB conectado");
}

module.exports = { connectDB };
