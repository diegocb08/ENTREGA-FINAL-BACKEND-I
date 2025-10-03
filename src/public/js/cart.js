(function () {
  const container = document.getElementById("cartView");
  if (!container) return;

  const cid = container.dataset.cid;
  if (!cid) return;

  container.querySelectorAll(".delBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const pid = btn.dataset.pid;
      if (!pid) return;

      const response = await fetch(`/api/carts/${cid}/products/${pid}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));
      if (data.status === "success") {
        window.location.reload();
      } else {
        alert(data.error || "Error al eliminar");
      }
    });
  });

  const emptyBtn = container.querySelector("#emptyBtn");
  emptyBtn?.addEventListener("click", async () => {
    const response = await fetch(`/api/carts/${cid}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (data.status === "success") {
      window.location.reload();
    } else {
      alert(data.error || "Error al vaciar");
    }
  });
})();
