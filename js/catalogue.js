(async () => {
  "use strict";
  const categories = {
    cleaning: { name: "Cleaning & Housekeeping", folder: "cleaning-housekeeping" },
    plastic: { name: "Plastic Household Items", folder: "plastic-household-items" },
    storage: { name: "Storage & Organisation", folder: "storage-organisation" },
    furniture: { name: "Chairs & Furniture", folder: "chairs-furniture" },
    kitchen: { name: "Kitchen & Dining", folder: "kitchen-dining" },
    bathroom: { name: "Bathroom Accessories", folder: "bathroom-accessories" },
    other: { name: "Other Household Products", folder: "other-household-products" }
  };

  // Load the entire product-images directory from GitHub in one request.
  // This avoids making eight Contents API calls on every page visit.
  async function getAllProductImages() {
    const response = await fetch(
      "https://api.github.com/repos/ayushyt69/rahul-housekeeping-/git/trees/main?recursive=1",
      { headers: { Accept: "application/vnd.github+json" }, cache: "no-store" }
    );
    if (!response.ok) throw new Error("GitHub returned " + response.status);
    const data = await response.json();
    if (data.truncated) throw new Error("GitHub returned an incomplete file listing");

    return data.tree
      .filter(entry => {
        if (entry.type !== "blob" || !entry.path.startsWith("product-images/")) return false;
        const name = entry.path.toLowerCase();
        return /\.(jpg|jpeg|png|webp|gif)$/.test(name);
      })
      .map(entry => ({
        name: entry.path.split("/").pop(),
        path: entry.path,
        src: "https://raw.githubusercontent.com/ayushyt69/rahul-housekeeping-/main/" +
          entry.path.split("/").map(encodeURIComponent).join("/")
      }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
  }

  let allImages = [];
  const categoryImages = Object.fromEntries(Object.keys(categories).map(key => [key, []]));
  try {
    allImages = await getAllProductImages();
    allImages.forEach(image => {
      const category = Object.entries(categories).find(([, value]) =>
        image.path.startsWith("product-images/" + value.folder + "/")
      );
      if (category) categoryImages[category[0]].push(image);
    });
  } catch (error) {
    console.error("Could not load the product catalogue", error);
  }

  const grid = document.getElementById("catalogue-grid");
  const empty = document.getElementById("catalogue-empty");
  const title = document.getElementById("catalogue-current-title");
  const count = document.getElementById("catalogue-count");
  const buttons = [...document.querySelectorAll("[data-category]")];
  let visibleImages = [];
  let activeCategory = "all";
  const searchInput = document.getElementById("productSearch");
  const noResults = document.getElementById("catalogue-no-results");
  const allCount = document.getElementById("all-count");

  function render(category = activeCategory) {
    activeCategory = category;
    const source = category === "all" ? allImages : (categoryImages[category] || []);
    const query = (searchInput?.value || "").trim().toLowerCase();
    const selected = source.filter(image => {
      if (!query) return true;
      const folderCategory = Object.entries(categories).find(([, value]) =>
        image.path.startsWith("product-images/" + value.folder + "/")
      );
      const categoryName = category === "all" ? (folderCategory?.[1].name || "") : (categories[category]?.name || "");
      return (image.name + " " + categoryName).toLowerCase().includes(query);
    });
    visibleImages = selected;
    title.textContent = category === "all" ? "All Products" : categories[category].name;
    count.textContent = selected.length + (selected.length === 1 ? " photo" : " photos");
    if (allCount) allCount.textContent = allImages.length;
    grid.innerHTML = selected.map((image, index) =>
      '<article class="catalogue-product-card">' +
      '<button class="catalogue-product-open" type="button" data-image-index="' + index +
      '" aria-label="Open product photo ' + (index + 1) + '">' +
      '<img src="' + image.src + '" alt="Rahul Housekeeping product photograph ' +
      (index + 1) + '" loading="lazy"></button></article>'
    ).join("");

    const searchHasNoMatches = Boolean(query) && selected.length === 0;
    noResults.hidden = !searchHasNoMatches;
    empty.hidden = selected.length > 0 || searchHasNoMatches;
    const heading = empty.querySelector("h3");
    const message = empty.querySelector("p");
    if (category === "all" && !allImages.length) {
      heading.textContent = "Product photos are temporarily unavailable";
      message.textContent = "Please try again later or call us to enquire about products.";
    } else if (category !== "all") {
      heading.textContent = "Photos coming soon";
      message.textContent = "Product photos for this category will be added here. Call us if you need help checking availability.";
    }
  }

  buttons.forEach(button => button.addEventListener("click", () => {
    buttons.forEach(item => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    if (searchInput) searchInput.value = "";
    render(button.dataset.category);
  }));
  searchInput?.addEventListener("input", () => render());

  const viewer = document.createElement("div");
  viewer.className = "photo-viewer";
  viewer.hidden = true;
  viewer.setAttribute("role", "dialog");
  viewer.setAttribute("aria-modal", "true");
  viewer.setAttribute("aria-label", "Product photograph viewer");
  viewer.innerHTML =
    '<button class="photo-viewer-close" type="button" aria-label="Close image viewer">×</button>' +
    '<button class="photo-viewer-nav photo-viewer-prev" type="button" aria-label="Previous photograph">‹</button>' +
    '<div class="photo-viewer-content"><img class="photo-viewer-image" alt="Full-size product photograph"></div>' +
    '<button class="photo-viewer-nav photo-viewer-next" type="button" aria-label="Next photograph">›</button>' +
    '<p class="photo-viewer-count" aria-live="polite"></p>';
  document.body.appendChild(viewer);

  const fullImage = viewer.querySelector(".photo-viewer-image");
  const viewerCount = viewer.querySelector(".photo-viewer-count");
  let currentIndex = 0;
  let returnFocus = null;

  function showPhoto(index) {
    currentIndex = (index + visibleImages.length) % visibleImages.length;
    fullImage.src = visibleImages[currentIndex].src;
    fullImage.alt = "Rahul Housekeeping product photo " + (currentIndex + 1);
    viewerCount.textContent = (currentIndex + 1) + " / " + visibleImages.length;
    viewer.querySelector(".photo-viewer-prev").hidden = visibleImages.length < 2;
    viewer.querySelector(".photo-viewer-next").hidden = visibleImages.length < 2;
    viewer.querySelector(".photo-viewer-content").scrollTop = 0;
  }

  function closeViewer() {
    viewer.hidden = true;
    document.body.classList.remove("photo-viewer-open");
    returnFocus?.focus();
  }

  grid.addEventListener("click", event => {
    const trigger = event.target.closest("[data-image-index]");
    if (!trigger || !visibleImages.length) return;
    returnFocus = trigger;
    showPhoto(Number(trigger.dataset.imageIndex));
    viewer.hidden = false;
    document.body.classList.add("photo-viewer-open");
    viewer.querySelector(".photo-viewer-close").focus();
  });
  viewer.querySelector(".photo-viewer-close").addEventListener("click", closeViewer);
  viewer.querySelector(".photo-viewer-prev").addEventListener("click", () => showPhoto(currentIndex - 1));
  viewer.querySelector(".photo-viewer-next").addEventListener("click", () => showPhoto(currentIndex + 1));
  viewer.addEventListener("click", event => { if (event.target === viewer) closeViewer(); });
  document.addEventListener("keydown", event => {
    if (viewer.hidden) return;
    if (event.key === "Escape") closeViewer();
    if (event.key === "ArrowLeft") showPhoto(currentIndex - 1);
    if (event.key === "ArrowRight") showPhoto(currentIndex + 1);
  });

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

  const credit = document.querySelector(".developer-credit");
  if (credit && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        credit.classList.add("is-visible");
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(credit);
  } else {
    credit?.classList.add("is-visible");
  }
  const year = document.getElementById("current-year");
  if (year) year.textContent = new Date().getFullYear();

  render("all");
})();