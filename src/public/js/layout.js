(function () {
  const cidKey = "cid";
  const cidBadge = document.getElementById("cidBadge");

  function isHex24(s) {
    return /^[a-f0-9]{24}$/i.test(s || "");
  }
  function getCid() {
    return localStorage.getItem(cidKey);
  }
  function setCid(cid) {
    localStorage.setItem(cidKey, cid);
    refreshCidBadge();
  }
  function refreshCidBadge() {
    const cid = getCid();
    if (cidBadge) cidBadge.textContent = "CID: " + (cid || "—");
  }

  async function createCart() {
    const r = await fetch("/api/carts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await r.json();
    if (data?.status === "success" && data?.cart?._id) {
      setCid(data.cart._id);
      return data.cart._id;
    }
    throw new Error(data?.error || "No se pudo crear el carrito");
  }

  async function getOrCreateCart() {
    let cid = getCid();
    if (!isHex24(cid)) cid = await createCart();
    return cid;
  }

  document.addEventListener("click", async (e) => {
    if (e.target?.id === "newCartBtn") {
      e.preventDefault();
      try {
        const existingCid = getCid();
        if (isHex24(existingCid)) {
          const confirmed = window.confirm(
            "Ya tenés un carrito activo. ¿Querés crear uno nuevo y reemplazarlo?"
          );
          if (!confirmed) {
            return;
          }
        }
        const cid = await createCart();
        window.location = "/carts/" + cid;
      } catch (err) {
        alert(err.message || "Error creando carrito");
      }
    }
    if (e.target?.id === "myCartBtn") {
      e.preventDefault();
      try {
        const cid = await getOrCreateCart();
        window.location = "/carts/" + cid;
      } catch (err) {
        alert(err.message || "Error abriendo carrito");
      }
    }
  });

  refreshCidBadge();
})();
