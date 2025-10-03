// src/public/js/realtime.js
(function () {
  const socket = io();
  const tbody = document.querySelector("#productsTable tbody");
  const form = document.getElementById("createForm");
  const formMsg = document.getElementById("formMsg");

  function renderRows(items) {
    tbody.innerHTML = "";
    items.forEach((p) => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid #f3f4f6";
      tr.innerHTML = `
        <td>${escapeHTML(p.title ?? "")}</td>
        <td>${escapeHTML(p.category ?? "")}</td>
        <td>$${Number(p.price ?? 0).toFixed(2)}</td>
        <td>${Number(p.stock ?? 0)}</td>
        <td>${p.status ? "✔" : "✖"}</td>
        <td>${escapeHTML(p.code ?? "")}</td>
        <td style="text-align:right;">
          <button data-pid="${p._id}" class="delBtn">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll(".delBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pid = btn.getAttribute("data-pid");
        if (!pid) return;
        if (!confirm("¿Eliminar este producto?")) return;
        socket.emit("product:delete", { pid });
      });
    });
  }

  socket.on("products:list", (items) => renderRows(items || []));
  socket.on("product:error", ({ message }) => toast(`Error: ${message}`));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      title: fd.get("title"),
      code: fd.get("code"),
      price: Number(fd.get("price")),
      stock: Number(fd.get("stock")),
      category: fd.get("category"),
      status: String(fd.get("status")) === "true",
      description: fd.get("description") || "",
    };
    if (!payload.title || !payload.code)
      return toast("Faltan campos obligatorios");
    socket.emit("product:create", payload);
    form.reset();
    formMsg.textContent = "✓ Creado";
    setTimeout(() => (formMsg.textContent = ""), 1200);
  });

  function toast(msg) {
    formMsg.textContent = msg;
    setTimeout(() => (formMsg.textContent = ""), 2000);
  }

  function escapeHTML(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
