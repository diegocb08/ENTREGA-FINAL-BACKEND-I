require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { engine } = require("express-handlebars");
const { connectDB } = require("./src/config/db");

// Routers
const productsRouter = require("./src/routers/products.router");
const cartsRouter = require("./src/routers/carts.router");
const viewsRouter = require("./src/routers/views.router");

// Sockets (productos en tiempo real)
const { registerProductSockets } = require("./src/ws/products.ws");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ---- Middlewares base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "src/public")));

// ---- Handlebars
app.engine(
  "handlebars",
  engine({
    helpers: {
      eq: (a, b) => a === b,
      json: (c) => JSON.stringify(c),
    },
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "src/views"));

// ---- API routes
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// ---- Views
app.use("/", viewsRouter);

// ---- Socket.io
registerProductSockets(io);

// ---- 404 catch-all (vistas)
app.use((req, res) => {
  res.status(404).render("404", { message: "Ruta no encontrada" });
});

// ---- Error handler
app.use((err, req, res, _next) => {
  console.error("Error:", err);
  if (req.accepts("html")) {
    return res
      .status(500)
      .render("404", { message: "Ocurrió un error inesperado" });
  }
  res.status(500).json({ status: "error", error: err.message });
});

// ---- Bootstrap
const PORT = process.env.PORT || 8080;
(async () => {
  await connectDB(process.env.MONGODB_URI);
  server.listen(PORT, () => {
    console.log(`Servidor disponible en http://localhost:${PORT}`);
  });
})();
