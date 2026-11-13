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

  
  // Private customer ratings: submissions are sent to the owner's Google Sheet.
  const ratingsEndpoint = "https://script.google.com/macros/s/AKfycbx-8nWZxWp9sNuMFphZvLa2pF6n6qRVVWeSRumZRLg1eh1VcYDO6JISGUHIrTs_Tfu_/exec";
  const ratingForm = document.getElementById("customer-rating-form");
  const ratingStars = Array.from(document.querySelectorAll(".rating-star"));
  const ratingHint = document.getElementById("rating-selection-hint");
  const ratingSubmit = document.getElementById("rating-submit");
  const ratingStatus = document.getElementById("rating-form-status");
  const ratingPrompt = document.getElementById("rating-prompt");
  const ratingPromptClose = document.getElementById("rating-prompt-close");
  const ratingPromptAction = document.getElementById("rating-prompt-action");
  let selectedRating = 0;

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

  function setRating(value) {
    selectedRating = value;
    ratingStars.forEach((star, index) => {
      const active = index < value;
      star.classList.toggle("is-active", active);
      star.setAttribute("aria-pressed", String(Number(star.dataset.rating) === value));
    });
    if (ratingHint) ratingHint.textContent = ratingLabels[value] || "Tap a star to rate";
    if (ratingSubmit) ratingSubmit.disabled = value === 0;
  }

  ratingStars.forEach(star => {
    star.addEventListener("click", () => setRating(Number(star.dataset.rating)));
    star.addEventListener("keydown", event => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const next = Math.min(5, Math.max(1, Number(star.dataset.rating) + (event.key === "ArrowRight" ? 1 : -1)));
        setRating(next);
        ratingStars[next - 1]?.focus();
      }
    });
  });

  function hideRatingPrompt(permanent = true) {
    if (ratingPrompt) ratingPrompt.hidden = true;
    if (permanent) {
      try { localStorage.setItem("rahulHousekeepingRatingPromptSeen", "1"); } catch (_) {}
    }
  }

  function showRatingPrompt() {
    if (!ratingPrompt) return;
    try {
      if (localStorage.getItem("rahulHousekeepingRatingPromptSeen") === "1" ||
          localStorage.getItem("rahulHousekeepingRatingSubmitted") === "1") return;
      localStorage.setItem("rahulHousekeepingRatingPromptSeen", "1");
    } catch (_) {}
    ratingPrompt.hidden = false;
  }

  ratingPromptClose?.addEventListener("click", () => hideRatingPrompt(true));
  ratingPromptAction?.addEventListener("click", () => {
    hideRatingPrompt(true);
    document.getElementById("rate-experience")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  if (ratingPrompt) {
    let promptTriggered = false;
    const triggerPrompt = () => {
      if (promptTriggered) return;
      promptTriggered = true;
      showRatingPrompt();
      window.removeEventListener("scroll", onRatingScroll);
    };
    const onRatingScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0 && window.scrollY / scrollable > 0.48) triggerPrompt();
    };
    window.addEventListener("scroll", onRatingScroll, { passive: true });
    window.setTimeout(triggerPrompt, 35000);
  }

  ratingForm?.addEventListener("submit", async event => {
    event.preventDefault();
    if (!selectedRating || ratingSubmit?.disabled) return;

    const review = document.getElementById("rating-review")?.value.trim() || "";
    const website = ratingForm.querySelector('input[name="website"]')?.value || "";
    ratingSubmit.disabled = true;
    ratingSubmit.textContent = "Submitting...";
    if (ratingStatus) {
      ratingStatus.textContent = "";
      ratingStatus.classList.remove("is-error");
    }

    try {
      const body = new URLSearchParams({
        rating: String(selectedRating),
        review,
        website
      });

      // Apps Script accepts this simple form-encoded POST without a CORS preflight.
      // no-cors makes the response unreadable, but the browser still sends the submission.
      await fetch(ratingsEndpoint, {
        method: "POST",
        mode: "no-cors",
        body
      });

      if (ratingStatus) ratingStatus.textContent = "Thank you. Your feedback has been sent privately.";
      ratingForm.reset();
      setRating(0);
      try { localStorage.setItem("rahulHousekeepingRatingSubmitted", "1"); } catch (_) {}
      hideRatingPrompt(true);
    } catch (error) {
      if (ratingStatus) {
        ratingStatus.textContent = "We couldn't send your feedback. Please try again.";
        ratingStatus.classList.add("is-error");
      }
      ratingSubmit.disabled = false;
      ratingSubmit.innerHTML = 'Submit Feedback <span aria-hidden="true">↗</span>';
    }
  });

})();