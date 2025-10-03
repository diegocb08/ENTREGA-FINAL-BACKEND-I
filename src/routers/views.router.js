const { Router } = require("express");
const ProductDAO = require("../dao/product.dao");
const CartDAO = require("../dao/cart.dao");

const router = Router();
const productDAO = new ProductDAO();
const cartDAO = new CartDAO();

function buildViewLink(req, targetPage) {
  if (!targetPage) return null;
  const url = new URL(req.protocol + "://" + req.get("host") + req.originalUrl);
  url.pathname = "/products";
  url.searchParams.set("page", String(targetPage));

  const keys = [
    "limit",
    "sort",
    "query",
    "category",
    "status",
    "minPrice",
    "maxPrice",
  ];
  for (const key of keys) {
    const val = req.query[key];
    if (val != null && val !== "") url.searchParams.set(key, String(val));
    else url.searchParams.delete(key);
  }
  return url.pathname + "?" + url.searchParams.toString();
}

router.get("/", (_req, res) => res.redirect("/products"));

/** Home estática (pre-entrega 2) */
router.get("/home", async (_req, res, next) => {
  try {
    const products = await productDAO.getProducts(); // sin paginar: vista estática
    res.render("home", { products, title: "Home" });
  } catch (err) {
    next(err);
  }
});

/** Listado paginado con filtros/orden (entrega final) */
router.get("/products", async (req, res, next) => {
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

    res.render("products", {
      products: result.payload,
      page: result.page,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: buildViewLink(req, result.prevPage),
      nextLink: buildViewLink(req, result.nextPage),
      query: query || "",
      sort: sort || "",
      status: status || "",
      limit: Number(limit) || 10,
      title: "Productos",
    });
  } catch (err) {
    next(err);
  }
});

/** Detalle de producto */
router.get("/products/:pid", async (req, res, next) => {
  try {
    const product = await productDAO.getProductById(req.params.pid);
    if (!product) {
      res.status(404);
      return res.render("404", {
        message: "Producto no encontrado",
        title: "No encontrado",
      });
    }
    res.render("productDetail", { product, title: product.title });
  } catch (err) {
    next(err);
  }
});

/** Carrito poblado */
router.get("/carts/:cid", async (req, res, next) => {
  try {
    const cart = await cartDAO.getCartById(req.params.cid);
    if (!cart) {
      res.status(404);
      return res.render("404", {
        message: "Carrito no encontrado",
        title: "No encontrado",
      });
    }
    const total = (cart.products || []).reduce((acc, it) => {
      const price = Number(it?.product?.price) || 0;
      const qty = Number(it?.quantity) || 0;
      return acc + price * qty;
    }, 0);

    res.render("cart", { cart, cid: req.params.cid, total, title: "Carrito" });
  } catch (err) {
    next(err);
  }
});

/** Realtime (pre-entrega 2) */
router.get("/realtimeproducts", async (_req, res, next) => {
  try {
    res.render("realTimeProducts", { title: "Productos en tiempo real" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
