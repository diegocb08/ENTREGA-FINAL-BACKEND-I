const Cart = require("../models/cart.model");

class CartDAO {
  async createCart() {
    const cart = await Cart.create({ products: [] });
    return cart.toObject();
  }

  // GET con populate (consigna)
  async getCartById(cid) {
    return await Cart.findById(cid).populate("products.product").lean();
  }

  // POST /api/carts/:cid/product/:pid  (agregar +1)
  async addProductToCart(cid, pid) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    const idx = cart.products.findIndex((p) => p.product.toString() === pid);
    if (idx >= 0) {
      cart.products[idx].quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    return cart.toObject();
  }

  // ⭐ DELETE /api/carts/:cid/products/:pid (eliminar un producto del carrito)
  async removeProduct(cid, pid) {
    const res = await Cart.updateOne(
      { _id: cid },
      { $pull: { products: { product: pid } } }
    );
    return res.matchedCount > 0; // true si el cart existe
  }

  // ⭐ PUT /api/carts/:cid (reemplazar todos los productos por un array)
  // body: { products: [{ product: "<pid>", quantity: N }, ...] }
  async replaceProducts(cid, productsArray) {
    if (!Array.isArray(productsArray)) {
      throw new Error("Se espera 'products' como arreglo");
    }
    const updated = await Cart.findByIdAndUpdate(
      cid,
      { products: productsArray },
      { new: true, runValidators: true, lean: true }
    );
    return updated; // null si no existe
  }

  // ⭐ PUT /api/carts/:cid/products/:pid (actualizar SOLO la cantidad)
  async updateProductQuantity(cid, pid, quantity) {
    if (!(quantity > 0)) throw new Error("quantity debe ser > 0");
    const updated = await Cart.findOneAndUpdate(
      { _id: cid, "products.product": pid },
      { $set: { "products.$.quantity": quantity } },
      { new: true, lean: true }
    );
    return updated; // null si no existe cart o no estaba ese product
  }

  // ⭐ DELETE /api/carts/:cid (vaciar carrito)
  async clearCart(cid) {
    const cleared = await Cart.findByIdAndUpdate(
      cid,
      { products: [] },
      { new: true, lean: true }
    );
    return cleared; // null si no existe
  }
}

module.exports = CartDAO;
