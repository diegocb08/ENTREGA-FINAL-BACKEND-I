const { Router } = require("express");
const CartDAO = require("../dao/cart.dao");
const cartDAO = new CartDAO();

const router = Router();

// Crear carrito
router.post("/", async (_req, res) => {
  try {
    const cart = await cartDAO.createCart();
    res.status(201).json({ status: "success", cart });
  } catch {
    res.status(500).json({ status: "error", error: "Error al crear carrito" });
  }
});

// Obtener carrito con populate
router.get("/:cid", async (req, res) => {
  try {
    const cart = await cartDAO.getCartById(req.params.cid);
    if (cart) return res.json({ status: "success", cart });
    res.status(404).json({ status: "error", error: "Carrito no encontrado" });
  } catch {
    res
      .status(500)
      .json({ status: "error", error: "Error al obtener carrito" });
  }
});

// Agregar producto (+1) al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const updated = await cartDAO.addProductToCart(
      req.params.cid,
      req.params.pid
    );
    if (updated) return res.json({ status: "success", cart: updated });
    res.status(404).json({ status: "error", error: "Carrito no encontrado" });
  } catch {
    res
      .status(500)
      .json({ status: "error", error: "Error al agregar producto" });
  }
});

// ⭐ DELETE api/carts/:cid/products/:pid - eliminar un producto específico del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const ok = await cartDAO.removeProduct(req.params.cid, req.params.pid);
    if (ok)
      return res.json({
        status: "success",
        message: "Producto eliminado del carrito",
      });
    res.status(404).json({ status: "error", error: "Carrito no encontrado" });
  } catch {
    res
      .status(500)
      .json({
        status: "error",
        error: "Error al eliminar producto del carrito",
      });
  }
});

// ⭐ PUT api/carts/:cid - reemplazar TODOS los productos del carrito
// Body esperado: { "products": [ { "product": "<pid>", "quantity": N }, ... ] }
router.put("/:cid", async (req, res) => {
  try {
    const { products } = req.body;
    const updated = await cartDAO.replaceProducts(req.params.cid, products);
    if (updated) return res.json({ status: "success", cart: updated });
    res.status(404).json({ status: "error", error: "Carrito no encontrado" });
  } catch (err) {
    res.status(400).json({ status: "error", error: err.message });
  }
});

// ⭐ PUT api/carts/:cid/products/:pid - actualizar SOLO la cantidad del producto
// Body esperado: { "quantity": N }
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { quantity } = req.body;
    const updated = await cartDAO.updateProductQuantity(
      req.params.cid,
      req.params.pid,
      Number(quantity)
    );
    if (updated) return res.json({ status: "success", cart: updated });
    res
      .status(404)
      .json({ status: "error", error: "Carrito o producto no encontrado" });
  } catch (err) {
    res.status(400).json({ status: "error", error: err.message });
  }
});

// ⭐ DELETE api/carts/:cid - vaciar carrito
router.delete("/:cid", async (req, res) => {
  try {
    const cleared = await cartDAO.clearCart(req.params.cid);
    if (cleared) return res.json({ status: "success", cart: cleared });
    res.status(404).json({ status: "error", error: "Carrito no encontrado" });
  } catch {
    res.status(500).json({ status: "error", error: "Error al vaciar carrito" });
  }
});

module.exports = router;
