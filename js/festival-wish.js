/* Show the Chhath greeting on each fresh homepage visit until its expiry. */
(() => {
  const modal = document.getElementById("festival-wish-modal");
  const close = document.getElementById("festival-wish-close");
  const poster = modal?.querySelector(".festival-wish-image");
  poster?.addEventListener("error", () => { poster.hidden = true; });
  if (!modal) return;

  // Expiry: 17 November 2026, 12:00 AM Indian Standard Time.
  const expiry = new Date("2026-11-17T00:00:00+05:30");
  if (Date.now() >= expiry.getTime()) {
    modal.remove();
    return;
  }

  const dismiss = () => {
    modal.hidden = true;
    document.body.classList.remove("festival-wish-open");
    document.removeEventListener("keydown", onKeydown);
  };
  const onKeydown = event => {
    if (event.key === "Escape") dismiss();
  };

  const open = () => {
    modal.hidden = false;
    document.body.classList.add("festival-wish-open");
    document.addEventListener("keydown", onKeydown);
  };

  close?.addEventListener("click", event => {
    event.stopPropagation();
    dismiss();
  });
  modal.addEventListener("click", dismiss);
  open();
})();
