(async () => {
  "use strict";

  // Live offers: any supported image uploaded to /offers is shown automatically.
  const offersOpen = document.getElementById("offers-open");
  const offersModal = document.getElementById("offers-modal");
  const offersClose = document.getElementById("offers-close");
  const offersEmpty = document.getElementById("offers-empty");
  const offersBanner = document.getElementById("offers-banner");
  let offersReturnFocus = null;

  async function loadCurrentOffer() {
    offersEmpty.hidden = false;
    offersBanner.hidden = true;
    offersEmpty.textContent = "No offers available right now.";
    try {
      const response = await fetch(
        "https://api.github.com/repos/ayushyt69/rahul-housekeeping-/contents/offers?ref=main",
        { headers: { Accept: "application/vnd.github+json" }, cache: "no-store" }
      );
      if (!response.ok) throw new Error("Offers folder could not be checked");
      const files = await response.json();
      const offerImages = files
        .filter(file => file.type === "file" && /\.(jpe?g|png|webp|gif)$/i.test(file.name))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
      if (!offerImages.length) return;
      offersBanner.src = offerImages[0].download_url;
      offersBanner.hidden = false;
      offersEmpty.hidden = true;
    } catch (error) {
      console.warn("Could not load current offers.", error);
      offersEmpty.textContent = "Offers are temporarily unavailable. Please try again later.";
    }
  }

  function closeOffers() {
    if (!offersModal || offersModal.hidden) return;
    offersModal.hidden = true;
    document.body.classList.remove("offers-open");
    offersReturnFocus?.focus();
  }

  offersOpen?.addEventListener("click", async () => {
    offersReturnFocus = offersOpen;
    offersModal.hidden = false;
    document.body.classList.add("offers-open");
    offersClose?.focus();
    await loadCurrentOffer();
  });
  offersClose?.addEventListener("click", closeOffers);
  offersModal?.addEventListener("click", event => {
    if (event.target === offersModal) closeOffers();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeOffers();
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