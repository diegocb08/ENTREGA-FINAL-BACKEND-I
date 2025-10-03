const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const CartDAO = require("../dao/cart.dao");
const cartDAO = new CartDAO();

const router = Router();

// Crear carrito
router.post("/", async (_req, res) => {
  try {
    const cart = await cartDAO.createCart();
    res.status(201).json({ status: "success", cart });
  } catch (e) {
    res.status(500).json({ status: "error", error: e.message });
  }
});

// GET carrito poblado
router.get("/:cid", async (req, res) => {
  const { cid } = req.params;
  if (!isValidObjectId(cid)) {
    return res.status(400).json({ status: "error", error: "cid inválido" });
  }
  try {
    const cart = await cartDAO.getCartById(cid);
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });
    res.json({ status: "success", payload: cart });
  } catch (e) {
    res.status(500).json({ status: "error", error: e.message });
  }
});

// Agregar producto (+inc)
router.post("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
    return res.status(400).json({ status: "error", error: "cid/pid inválido" });
  }
  try {
    const inc = Number(req.body?.inc ?? 1);
    const updated = await cartDAO.addProductToCart(cid, pid, inc);
    if (!updated)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });
    res.json({ status: "success", payload: updated });
  } catch (e) {
    res.status(500).json({ status: "error", error: e.message });
  }
});

// Eliminar producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
    return res.status(400).json({ status: "error", error: "cid/pid inválido" });
  }
  try {
    const updated = await cartDAO.removeItem(cid, pid);
    if (!updated)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });
    res.json({ status: "success", payload: updated });
  } catch (e) {
    res.status(500).json({ status: "error", error: e.message });
  }
});

// Reemplazar todo el array de productos
router.put("/:cid", async (req, res) => {
  const { cid } = req.params;
  if (!isValidObjectId(cid)) {
    return res.status(400).json({ status: "error", error: "cid inválido" });
  }
  try {
    const products = Array.isArray(req.body?.products) ? req.body.products : [];
    const updated = await cartDAO.replaceItems(cid, products);
    if (!updated)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });
    res.json({ status: "success", payload: updated });
  } catch (e) {
    res.status(500).json({ status: "error", error: e.message });
  }
});

// Actualizar cantidad de un producto
router.put("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
    return res.status(400).json({ status: "error", error: "cid/pid inválido" });
  }
  try {
    const qty = Number(req.body?.quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return res
        .status(400)
        .json({ status: "error", error: "quantity debe ser >= 1" });
    }
    const updated = await cartDAO.updateQty(cid, pid, qty);
    if (!updated)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito o producto no encontrado" });
    res.json({ status: "success", payload: updated });
  } catch (e) {
    res.status(500).json({ status: "error", error: e.message });
  }
});

// Vaciar carrito
router.delete("/:cid", async (req, res) => {
  const { cid } = req.params;
  if (!isValidObjectId(cid)) {
    return res.status(400).json({ status: "error", error: "cid inválido" });
  }
  try {
    const cleared = await cartDAO.clearCart(cid);
    if (!cleared)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });
    res.json({ status: "success", payload: cleared });
  } catch (e) {
    res.status(500).json({ status: "error", error: e.message });
  }
});

module.exports = router;
