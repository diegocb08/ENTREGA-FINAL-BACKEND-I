const Product = require("../models/product.model");

class ProductDAO {
  // CREATE
  async addProduct(data) {
    const { title, description, code, price, stock, category } = data;
    if (
      !title ||
      !description ||
      !code ||
      price == null ||
      stock == null ||
      !category
    ) {
      throw new Error("Campos obligatorios faltantes");
    }
    const exists = await Product.findOne({ code });
    if (exists) throw new Error(`El código '${code}' ya existe`);

    const doc = await Product.create({
      ...data,
      status: data.status ?? true,
      thumbnails: Array.isArray(data.thumbnails) ? data.thumbnails : [],
    });
    return doc.toObject();
  }

  // READ
  async getProducts() {
    return Product.find().lean();
  }

  async getProductById(id) {
    return Product.findById(id).lean();
  }

  // UPDATE (sin tocar _id)
  async updateProduct(id, data) {
    if (!id) throw new Error("id requerido");
    const toUpdate = { ...data };
    delete toUpdate._id;

    // Si cambian el code, debe ser único
    if (toUpdate.code) {
      const exists = await Product.findOne({
        code: toUpdate.code,
        _id: { $ne: id },
      });
      if (exists)
        throw new Error(`El código '${toUpdate.code}' ya está en uso`);
    }

    const updated = await Product.findByIdAndUpdate(id, toUpdate, {
      new: true,
      runValidators: true,
    }).lean();

    return updated;
  }

  // DELETE
  async deleteProduct(id) {
    return Product.findByIdAndDelete(id).lean();
  }

  /**
   * Paginación + filtros:
   * limit, page, sort=asc|desc (price), query (regex en title/category y palabras para disponibilidad),
   * category (case-insensitive), status=true|false, minPrice/maxPrice.
   */
  async getProductsPaginated({
    limit,
    page,
    sort,
    query,
    category,
    status,
    minPrice,
    maxPrice,
  }) {
    const _limit = Math.max(1, Number(limit) || 10);
    const _page = Math.max(1, Number(page) || 1);

    const filter = {};

    if (query) {
      const q = String(query).trim();
      const wordsForTrue = ["available", "disponible", "true", "1"];
      const wordsForFalse = ["unavailable", "no disponible", "false", "0"];
      if (wordsForTrue.includes(q.toLowerCase())) filter.status = true;
      if (wordsForFalse.includes(q.toLowerCase())) filter.status = false;

      const rx = new RegExp(q, "i");
      filter.$or = [{ title: rx }, { category: rx }];
    }

    if (category && String(category).trim() !== "") {
      filter.category = new RegExp(`^${String(category).trim()}$`, "i");
    }

    if (status !== undefined) {
      filter.status = String(status) === "true";
    }

    if (minPrice != null || maxPrice != null) {
      filter.price = {};
      if (minPrice != null) filter.price.$gte = Number(minPrice);
      if (maxPrice != null) filter.price.$lte = Number(maxPrice);
    }

    const sortOpt = {};
    if (sort === "asc") sortOpt.price = 1;
    if (sort === "desc") sortOpt.price = -1;

    const totalDocs = await Product.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(totalDocs / _limit));
    const skip = (_page - 1) * _limit;

    const docs = await Product.find(filter)
      .sort(sortOpt)
      .skip(skip)
      .limit(_limit)
      .lean();

    const prevPage = _page > 1 ? _page - 1 : null;
    const nextPage = _page < totalPages ? _page + 1 : null;

    return {
      status: "success",
      payload: docs,
      totalPages,
      prevPage,
      nextPage,
      page: _page,
      hasPrevPage: !!prevPage,
      hasNextPage: !!nextPage,
      totalDocs,
      limit: _limit,
    };
  }

  async getCategories() {
    const cats = await Product.distinct("category");
    const seen = new Set();
    const out = [];
    for (const c of cats) {
      const key = String(c).trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(c);
      }
    }
    return out.sort((a, b) => String(a).localeCompare(String(b)));
  }
}

module.exports = ProductDAO;
