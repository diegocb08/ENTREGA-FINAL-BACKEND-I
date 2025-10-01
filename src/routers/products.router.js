const { Router } = require("express");
const ProductDAO = require("../dao/product.dao");
const productDAO = new ProductDAO();

const router = Router();

/**
 * Construye un link preservando el resto de query params pero con la page indicada.
 */
function buildPageLink(req, targetPage, extra = {}) {
  const base = req.baseUrl || "/api/products";
  const params = new URLSearchParams(req.query);
  if (targetPage != null) params.set("page", String(targetPage));
  // aplicar extras (por ej. normalizar limit o sort si hicimos defaults)
  for (const [k, v] of Object.entries(extra)) {
    if (v === null || v === undefined || v === "") params.delete(k);
    else params.set(k, String(v));
  }
  return `${base}?${params.toString()}`;
}

// ⭐ GET /api/products  (paginación + filtros + orden + formato pedido)
router.get("/", async (req, res) => {
  try {
    const { limit, page, sort, query } = req.query;

    const result = await productDAO.getProductsPaginated({
      limit,
      page,
      sort,
      query,
    });

    // prev/next links (o null si no aplica)
    const prevLink = result.hasPrevPage
      ? buildPageLink(req, result.prevPage, {
          limit: result.limit,
          sort,
          query,
        })
      : null;

    const nextLink = result.hasNextPage
      ? buildPageLink(req, result.nextPage, {
          limit: result.limit,
          sort,
          query,
        })
      : null;

    res.json({
      status: "success",
      payload: result.payload,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// CRUD opcional (mantenerlos ayuda a probar con Postman y al realtime)
router.get("/:pid", async (req, res) => {
  try {
    const product = await productDAO.getProductById(req.params.pid);
    if (product) return res.json({ status: "success", product });
    res.status(404).json({ status: "error", error: "Producto no encontrado" });
  } catch {
    res
      .status(500)
      .json({ status: "error", error: "Error al obtener producto" });
  }
});

router.post("/", async (req, res) => {
  try {
    const created = await productDAO.addProduct(req.body);

    // emitir a vistas realtime (si las usás)
    const io = req.app.get("io");
    if (io) {
      const list = await productDAO.getProducts();
      io.emit("updateProducts", list);
    }

    res.status(201).json({ status: "success", product: created });
  } catch (err) {
    res.status(400).json({ status: "error", error: err.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const updated = await productDAO.updateProduct(req.params.pid, req.body);
    if (updated) {
      const io = req.app.get("io");
      if (io) {
        const list = await productDAO.getProducts();
        io.emit("updateProducts", list);
      }
      return res.json({ status: "success", product: updated });
    }
    res.status(404).json({ status: "error", error: "Producto no encontrado" });
  } catch (err) {
    res.status(400).json({ status: "error", error: err.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const ok = await productDAO.deleteProduct(req.params.pid);
    if (ok) {
      const io = req.app.get("io");
      if (io) {
        const list = await productDAO.getProducts();
        io.emit("updateProducts", list);
      }
      return res.json({ status: "success", message: "Producto eliminado" });
    }
    res.status(404).json({ status: "error", error: "Producto no encontrado" });
  } catch {
    res
      .status(500)
      .json({ status: "error", error: "Error al eliminar producto" });
  }
});

module.exports = router;
