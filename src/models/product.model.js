const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, index: true },
    status: { type: Boolean, default: true },
    category: { type: String, required: true, index: true },
    stock: { type: Number, default: 0 },
    thumbnails: [{ type: String }],
    code: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
