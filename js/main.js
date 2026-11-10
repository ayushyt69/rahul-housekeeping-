(async () => {
  "use strict";

  // Discover product photos directly from the GitHub folder.
  // Keep the local list as a fallback if the GitHub API is temporarily unavailable.
  async function getProductImages() {
    const fallback = Array.isArray(window.RAHUL_PRODUCTS) ? window.RAHUL_PRODUCTS : [];
    const cacheKey = "rahul-housekeeping-product-images-v1";
    const cacheTimeKey = cacheKey + "-time";
    const cacheDuration = 5 * 60 * 1000;

    try {
      const cached = sessionStorage.getItem(cacheKey);
      const cachedAt = Number(sessionStorage.getItem(cacheTimeKey) || 0);
      if (cached && Date.now() - cachedAt < cacheDuration) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (_) {}

    try {
      const response = await fetch(
        "https://api.github.com/repos/ayushyt69/rahul-housekeeping-/contents/product-images?ref=main",
        { headers: { Accept: "application/vnd.github+json" } }
      );
      if (!response.ok) throw new Error("GitHub image listing unavailable");
      const files = await response.json();
      const discovered = files
        .filter(file => file.type === "file" && /\\.(jpe?g|png|webp|gif)$/i.test(file.name))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }))
        .map(file => file.download_url)
        .filter(Boolean);

      if (discovered.length) {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(discovered));
          sessionStorage.setItem(cacheTimeKey, String(Date.now()));
        } catch (_) {}
        return discovered;
      }
    } catch (error) {
      console.warn("Could not refresh product photos from GitHub; using saved list.", error);
    }
    return fallback;
  }

  const images = await getProductImages();
  const grid = document.getElementById("product-grid");

  const previewCount = 4;
  const galleryToggle = document.getElementById("gallery-toggle");

  if (grid) {
    grid.innerHTML = images.map((src, index) => `
      <article class="product-card"${index >= previewCount ? " hidden" : ""}>
        <button class="product-image product-image-open" type="button" data-image-index="${index}" aria-label="View product photograph ${index + 1} in full size">
          <img src="${src}" alt="Rahul Housekeeping product ${index + 1}" loading="lazy">
        </button>
      </article>`).join("");
  }

  if (grid && galleryToggle && images.length > previewCount) {
    galleryToggle.querySelector("span").textContent = "↓";
    galleryToggle.firstChild.textContent = "View all photos ";
    galleryToggle.addEventListener("click", () => {
      const expanded = galleryToggle.getAttribute("aria-expanded") === "true";
      const cards = [...grid.querySelectorAll(".product-card")];
      cards.forEach((card, index) => {
        if (index >= previewCount) {
          card.hidden = expanded;
          if (!expanded) card.classList.add("gallery-card-revealed");
          else card.classList.remove("gallery-card-revealed");
        }
      });
      galleryToggle.setAttribute("aria-expanded", String(!expanded));
      galleryToggle.firstChild.textContent = expanded ? "View all photos " : "Show fewer photos ";
      galleryToggle.querySelector("span").textContent = expanded ? "↓" : "↑";
      if (expanded) document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  } else if (galleryToggle) {
    galleryToggle.hidden = true;
  }

  // Full-size, scrollable product photo viewer
  if (grid && images.length) {
    const viewer = document.createElement("div");
    viewer.className = "photo-viewer";
    viewer.hidden = true;
    viewer.setAttribute("role", "dialog");
    viewer.setAttribute("aria-modal", "true");
    viewer.setAttribute("aria-label", "Product photograph viewer");
    viewer.innerHTML = `
      <button class="photo-viewer-close" type="button" aria-label="Close image viewer">×</button>
      <button class="photo-viewer-nav photo-viewer-prev" type="button" aria-label="Previous photograph">‹</button>
      <div class="photo-viewer-content"><img class="photo-viewer-image" alt="Full-size product photograph"></div>
      <button class="photo-viewer-nav photo-viewer-next" type="button" aria-label="Next photograph">›</button>
      <p class="photo-viewer-count" aria-live="polite"></p>`;
    document.body.appendChild(viewer);

    const fullImage = viewer.querySelector(".photo-viewer-image");
    const count = viewer.querySelector(".photo-viewer-count");
    let currentIndex = 0;
    let previousFocus = null;

    function showPhoto(index) {
      currentIndex = (index + images.length) % images.length;
      fullImage.src = images[currentIndex];
      fullImage.alt = `Rahul Housekeeping product photograph ${currentIndex + 1}`;
      count.textContent = `${currentIndex + 1} / ${images.length}`;
      viewer.querySelector(".photo-viewer-prev").hidden = images.length < 2;
      viewer.querySelector(".photo-viewer-next").hidden = images.length < 2;
      viewer.querySelector(".photo-viewer-content").scrollTop = 0;
    }
    function closeViewer() {
      viewer.hidden = true;
      document.body.classList.remove("photo-viewer-open");
      previousFocus?.focus();
    }
    grid.addEventListener("click", event => {
      const trigger = event.target.closest("[data-image-index]");
      if (!trigger) return;
      previousFocus = trigger;
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
  }

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
  const developerCredit = document.querySelector(".developer-credit");
  if (developerCredit && "IntersectionObserver" in window) {
    const creditObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        developerCredit.classList.add("is-visible");
        creditObserver.disconnect();
      }
    }, { threshold: 0.35 });
    creditObserver.observe(developerCredit);
  } else {
    developerCredit?.classList.add("is-visible");
  }

  const year = document.getElementById("current-year");
  if (year) year.textContent = new Date().getFullYear();
})();