require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { engine } = require("express-handlebars");

app.engine(
  "handlebars",
  engine({
    helpers: {
      eq: (a, b) => a === b,
    },
  })
);

const path = require("path");
const { connectDB } = require("./src/config/db");

// Routers placeholder (los creamos en la ronda 4)
const productsRouter = require("./src/routers/products.router");
const cartsRouter = require("./src/routers/carts.router");
const viewsRouter = require("./src/routers/views.router");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 8080;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "src", "public")));

// Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "src", "views"));

// Exponer io
app.set("io", io);

// Routers (creamos archivos vacíos ya mismo para no romper el require)
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

// Socket.io (lo conectamos más adelante cuando haya DAO)
io.on("connection", (socket) => {
  console.log("🔌 Cliente conectado:", socket.id);
});

// Bootstrap
(async () => {
  await connectDB(process.env.MONGODB_URI);
  server.listen(PORT, () => {
    console.log(`🚀 Server listo en http://localhost:${PORT}`);
  });
})();
