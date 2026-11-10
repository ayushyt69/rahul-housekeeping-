(() => {
  "use strict";
  const images = Array.isArray(window.RAHUL_PRODUCTS) ? window.RAHUL_PRODUCTS : [];
  const grid = document.getElementById("product-grid");
  const empty = document.getElementById("catalogue-empty");
  const phone = "tel:+918539994074";

  if (grid) {
    grid.innerHTML = images.map((src, index) => `
      <article class="product-card">
        <div class="product-image">
          <img src="${src}" alt="Rahul Housekeeping product ${index + 1}" loading="lazy">
          <a class="product-enquiry" href="${phone}" aria-label="Enquire about this product">Enquiry</a>
        </div>
      </article>`).join("");
  }
  if (empty) empty.hidden = images.length > 0;

  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    nav?.classList.toggle("open", open);
  });
  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
  }));
  const year = document.getElementById("current-year");
  if (year) year.textContent = new Date().getFullYear();
})();