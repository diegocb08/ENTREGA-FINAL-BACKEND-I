const { Router } = require("express");
const ProductDAO = require("../dao/product.dao");
const productDAO = new ProductDAO();

const router = Router();

function buildLink(req, page, overrides = {}) {
  if (!page) return null;
  const url = new URL(req.protocol + "://" + req.get("host") + req.originalUrl);
  url.searchParams.set("page", String(page));
  for (const [k, v] of Object.entries(overrides)) {
    if (v === undefined || v === null || v === "") url.searchParams.delete(k);
    else url.searchParams.set(k, String(v));
  }
  return url.pathname + "?" + url.searchParams.toString();
}

router.get("/", async (req, res) => {
  try {
    const { limit, page, sort, query, category, status, minPrice, maxPrice } =
      req.query;

    const result = await productDAO.getProductsPaginated({
      limit,
      page,
      sort,
      query,
      category,
      status,
      minPrice,
      maxPrice,
    });

    const prevLink = result.hasPrevPage
      ? buildLink(req, result.prevPage, {
          limit: result.limit,
          sort,
          query,
          category,
          status,
          minPrice,
          maxPrice,
        })
      : null;
    const nextLink = result.hasNextPage
      ? buildLink(req, result.nextPage, {
          limit: result.limit,
          sort,
          query,
          category,
          status,
          minPrice,
          maxPrice,
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

router.get("/categories", async (_req, res) => {
  try {
    const cats = await productDAO.getCategories();
    res.json({ status: "success", payload: cats });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const product = await productDAO.getProductById(req.params.pid);
    if (!product)
      return res
        .status(404)
        .json({ status: "error", error: "Producto no encontrado" });
    res.json({ status: "success", payload: product });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const created = await productDAO.addProduct(req.body);
    res.status(201).json({ status: "success", payload: created });
  } catch (err) {
    res.status(400).json({ status: "error", error: err.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const updated = await productDAO.updateProduct(req.params.pid, req.body);
    if (!updated)
      return res
        .status(404)
        .json({ status: "error", error: "Producto no encontrado" });
    res.json({ status: "success", payload: updated });
  } catch (err) {
    res.status(400).json({ status: "error", error: err.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const deleted = await productDAO.deleteProduct(req.params.pid);
    if (!deleted)
      return res
        .status(404)
        .json({ status: "error", error: "Producto no encontrado" });
    res.json({ status: "success", payload: deleted });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

module.exports = router;
