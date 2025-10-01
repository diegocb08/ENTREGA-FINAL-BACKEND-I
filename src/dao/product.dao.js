const Product = require("../models/product.model");

class ProductDAO {
  // CREATE
  async addProduct(data) {
    const { title, description, code, price, stock, category } = data;
    if (!title || !description || !code || !price || !stock || !category) {
      throw new Error("Campos obligatorios faltantes");
    }
    const exists = await Product.findOne({ code });
    if (exists) throw new Error(`El código '${code}' ya existe`);

    const doc = await Product.create({
      ...data,
      status: data.status ?? true,
      thumbnails: data.thumbnails ?? [],
    });
    return doc.toObject();
  }

  // READ (sin paginación) — útil para sockets
  async getProducts() {
    return await Product.find().lean();
  }

  // READ by id
  async getProductById(id) {
    return await Product.findById(id).lean();
  }

  // UPDATE
  async updateProduct(id, updatedFields) {
    if (updatedFields?.id) delete updatedFields.id;
    const updated = await Product.findByIdAndUpdate(id, updatedFields, {
      new: true,
      runValidators: true,
      lean: true,
    });
    return updated; // null si no existe
  }

  // DELETE
  async deleteProduct(id) {
    const res = await Product.findByIdAndDelete(id);
    return !!res;
  }

  // ⭐ GET paginado/filtrado/ordenado (para GET /api/products)
  async getProductsPaginated({ limit = 10, page = 1, sort, query }) {
    // 1) Filtro: categoría o disponibilidad (status)
    const filter = {};
    if (query) {
      // soporta "category:Calzado", "status:true" o "Calzado" (interpreta categoría)
      if (query.includes(":")) {
        const [key, raw] = query.split(":");
        if (key === "category") filter.category = raw;
        if (key === "status") filter.status = raw === "true";
      } else {
        filter.category = query;
      }
    }

    // 2) Orden: por precio asc/desc
    const sortOpt = {};
    if (sort === "asc") sortOpt.price = 1;
    else if (sort === "desc") sortOpt.price = -1;

    // 3) Normalizar
    limit = Math.max(parseInt(limit) || 10, 1);
    page = Math.max(parseInt(page) || 1, 1);
    const skip = (page - 1) * limit;

    // 4) Consultas
    const [items, totalDocs] = await Promise.all([
      Product.find(filter).sort(sortOpt).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    // 5) Meta
    const totalPages = Math.max(Math.ceil(totalDocs / limit), 1);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    return {
      payload: items,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage,
      hasNextPage,
      totalDocs,
      limit,
    };
  }
}

module.exports = ProductDAO;
