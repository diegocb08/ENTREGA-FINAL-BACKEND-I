const Cart = require("../models/cart.model");

class CartDAO {
  async createCart() {
    const cart = await Cart.create({ products: [] });
    return cart.toObject();
  }

  async getCartById(cid) {
    return Cart.findById(cid).populate("products.product").lean();
  }

  async addProductToCart(cid, pid, inc = 1) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;
    const item = cart.products.find((p) => String(p.product) === String(pid));
    if (item) item.quantity += inc;
    else cart.products.push({ product: pid, quantity: Math.max(1, inc) });
    await cart.save();
    const populated = await cart.populate("products.product");
    return populated.toObject();
  }

  async removeItem(cid, pid) {
    const updated = await Cart.findByIdAndUpdate(
      cid,
      { $pull: { products: { product: pid } } },
      { new: true }
    ).populate("products.product");
    return updated ? updated.toObject() : null;
  }

  async replaceItems(cid, items) {
    const norm = (Array.isArray(items) ? items : [])
      .filter((i) => i && i.product)
      .map((i) => ({
        product: i.product,
        quantity: Math.max(1, Number(i.quantity) || 1),
      }));

    const updated = await Cart.findByIdAndUpdate(
      cid,
      { $set: { products: norm } },
      { new: true, runValidators: true }
    ).populate("products.product");
    return updated ? updated.toObject() : null;
  }

  async updateQty(cid, pid, qty) {
    const updated = await Cart.findOneAndUpdate(
      { _id: cid, "products.product": pid },
      { $set: { "products.$.quantity": qty } },
      { new: true, runValidators: true }
    ).populate("products.product");
    return updated ? updated.toObject() : null;
  }

  async clearCart(cid) {
    const updated = await Cart.findByIdAndUpdate(
      cid,
      { $set: { products: [] } },
      { new: true }
    ).populate("products.product");
    return updated ? updated.toObject() : null;
  }
}

module.exports = CartDAO;
