(() => {
  "use strict";

  const products = Array.isArray(window.RAHUL_PRODUCTS) ? window.RAHUL_PRODUCTS : [];
  const productGrid = document.getElementById("product-grid");
  const emptyState = document.getElementById("catalogue-empty");
  const searchInput = document.getElementById("product-search");
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const categoryLinks = [...document.querySelectorAll("[data-category-link]")];
  let activeCategory = "all";

  const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  function renderProducts() {
    const term = (searchInput?.value || "").trim().toLowerCase();
    const visible = products.filter(product => {
      const categoryMatch = activeCategory === "all" || product.category === activeCategory;
      const searchable = `${product.name || ""} ${product.category || ""} ${product.description || ""}`.toLowerCase();
      return categoryMatch && searchable.includes(term);
    });

    productGrid.innerHTML = visible.map(product => {
      const image = product.image
        ? `<img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name || "Product")}" loading="lazy">`
        : `<span class="product-placeholder" aria-hidden="true">RH</span>`;
      return `<article class="product-card">
        <div class="product-image">${image}</div>
        <div class="product-info">
          <span class="product-category">${escapeHTML(product.category || "Household")}</span>
          <h3>${escapeHTML(product.name || "Product")}</h3>
          <p>${escapeHTML(product.description || "")}</p>
        </div>
      </article>`;
    }).join("");

    emptyState.hidden = visible.length > 0;
    if (products.length === 0) {
      emptyState.hidden = false;
      emptyState.querySelector("h3").textContent = "Product catalogue is being updated";
      emptyState.querySelector("p").textContent = "We are organizing the product range. Call us to ask about a specific item, current price or availability.";
    } else if (visible.length === 0) {
      emptyState.querySelector("h3").textContent = "No matching products found";
      emptyState.querySelector("p").textContent = "Try another search term or select a different category.";
    }
  }

  function setCategory(category) {
    activeCategory = category;
    filterButtons.forEach(button => {
      const selected = button.dataset.filter === category;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    renderProducts();
  }

  filterButtons.forEach(button => button.addEventListener("click", () => setCategory(button.dataset.filter)));
  categoryLinks.forEach(link => link.addEventListener("click", () => {
    const category = link.dataset.categoryLink;
    setCategory(category);
    const matchingButton = filterButtons.find(button => button.dataset.filter === category);
    if (matchingButton) {
      // Keep the selected category even when the visitor arrives via a category tile.
      matchingButton.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }));
  searchInput?.addEventListener("input", renderProducts);

  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    nav.classList.toggle("open", open);
  });
  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
  }));

  const year = document.getElementById("current-year");
  if (year) year.textContent = new Date().getFullYear();

  renderProducts();
})();
