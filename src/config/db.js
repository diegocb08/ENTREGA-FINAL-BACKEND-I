const mongoose = require("mongoose");

async function connectDB(uri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { dbName: "ecommerce" });
  console.log("✅ MongoDB conectado");
}

module.exports = { connectDB };
