const { Router } = require("express");
const ProductDAO = require("../dao/product.dao");
const CartDAO = require("../dao/cart.dao");

const productDAO = new ProductDAO();
const cartDAO = new CartDAO();
const router = Router();

// /products -> lista con paginación (usa los mismos query params del API)
router.get("/products", async (req, res) => {
  const { limit, page, sort, query } = req.query;
  const result = await productDAO.getProductsPaginated({
    limit,
    page,
    sort,
    query,
  });

  // construir prev/next links para la UI
  const base = "/products";
  const params = new URLSearchParams({
    limit: String(result.limit),
    sort: sort || "",
    query: query || "",
  });

  const prevLink = result.hasPrevPage
    ? `${base}?${new URLSearchParams({
        ...Object.fromEntries(params),
        page: String(result.prevPage),
      })}`
    : null;

  const nextLink = result.hasNextPage
    ? `${base}?${new URLSearchParams({
        ...Object.fromEntries(params),
        page: String(result.nextPage),
      })}`
    : null;

  res.render("products", {
    title: "Productos",
    products: result.payload,
    page: result.page,
    totalPages: result.totalPages,
    hasPrevPage: result.hasPrevPage,
    hasNextPage: result.hasNextPage,
    prevLink,
    nextLink,
    query,
    sort,
    limit: result.limit,
  });
});

// (Opcional) detalle de producto con botón "Agregar al carrito"
router.get("/products/:pid", async (req, res) => {
  const product = await productDAO.getProductById(req.params.pid);
  if (!product) return res.status(404).send("Producto no encontrado");
  res.render("productDetail", { title: product.title, product });
});

// Vista de carrito con populate
router.get("/carts/:cid", async (req, res) => {
  const cart = await cartDAO.getCartById(req.params.cid);
  if (!cart) return res.status(404).send("Carrito no encontrado");
  res.render("cart", { title: `Carrito ${req.params.cid}`, cart });
});

// Home básica (por si entran a "/")
router.get("/", (_req, res) => {
  res.render("home", { title: "Home" });
});

module.exports = router;
