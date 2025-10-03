const ProductDAO = require("../dao/product.dao");
const productDAO = new ProductDAO();

function registerProductSockets(io) {
  io.on("connection", async (socket) => {
    try {
      const products = await productDAO.getProducts();
      socket.emit("products:list", products);
    } catch (e) {
      socket.emit("product:error", { message: e.message });
    }

    socket.on("product:create", async (payload) => {
      try {
        await productDAO.addProduct(payload);
        const products = await productDAO.getProducts();
        io.emit("products:list", products);
      } catch (e) {
        socket.emit("product:error", { message: e.message });
      }
    });

    socket.on("product:delete", async ({ pid }) => {
      try {
        await productDAO.deleteProduct(pid);
        const products = await productDAO.getProducts();
        io.emit("products:list", products);
      } catch (e) {
        socket.emit("product:error", { message: e.message });
      }
    });
  });
}

module.exports = { registerProductSockets };
