(function () {
  const $ = (sel) => document.querySelector(sel);
  const params = new URLSearchParams(window.location.search);

  if ($("#q")) $("#q").value = params.get("query") || $("#q").value;
  if (params.get("limit") && $("#limit"))
    $("#limit").value = params.get("limit");
  if (params.get("status") && $("#statusSelect"))
    $("#statusSelect").value = params.get("status");
  if (params.get("sort") && $("#sort")) $("#sort").value = params.get("sort");

  fetch("/api/products/categories")
    .then((r) => r.json())
    .then(({ status, payload }) => {
      if (status !== "success") return;
      const sel = $("#categorySelect");
      if (!sel) return;
      const current = params.get("category") || "";
      payload.forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        if (current && current.toLowerCase() === String(cat).toLowerCase())
          opt.selected = true;
        sel.appendChild(opt);
      });
    })
    .catch(() => {
      /* no-op */
    });

  $("#apply")?.addEventListener("click", () => {
    const q = $("#q")?.value.trim();
    const cat = $("#categorySelect")?.value;
    const status = $("#statusSelect")?.value;
    const sort = $("#sort")?.value;
    const limit = $("#limit")?.value;

    if (q) params.set("query", q);
    else params.delete("query");
    if (cat) params.set("category", cat);
    else params.delete("category");
    if (status) params.set("status", status);
    else params.delete("status");
    if (sort) params.set("sort", sort);
    else params.delete("sort");
    if (limit) params.set("limit", limit);
    else params.delete("limit");
    params.set("page", "1");
    window.location = "/products?" + params.toString();
  });

  function isHex24(s) {
    return /^[a-f0-9]{24}$/i.test(s || "");
  }
  async function createCart() {
    const r = await fetch("/api/carts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await r.json();
    if (data?.status === "success" && data?.cart?._id) return data.cart._id;
    throw new Error(data?.error || "No se pudo crear el carrito");
  }
  async function getOrCreateCartId() {
    let cid = localStorage.getItem("cid");
    if (!isHex24(cid)) {
      cid = await createCart();
      localStorage.setItem("cid", cid);
      const badge = document.getElementById("cidBadge");
      if (badge) badge.textContent = "CID: " + cid;
    }
    return cid;
  }

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".addToCartBtn");
    if (!btn) return;
    e.preventDefault();
    try {
      const pid = btn.dataset.pid;
      const cid = await getOrCreateCartId();
      const res = await fetch(`/api/carts/${cid}/products/${pid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.status === "success") {
        btn.textContent = "Agregado";
        setTimeout(() => (btn.textContent = "Agregar al carrito"), 1000);
      } else {
        alert(data.error || "Error al agregar");
      }
    } catch (err) {
      alert(err.message || "Error");
    }
  });
})();
