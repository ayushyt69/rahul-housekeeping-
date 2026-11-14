/* Show the Chhath greeting on each fresh homepage visit. */
(() => {
  const modal = document.getElementById("festival-wish-modal");
  const close = document.getElementById("festival-wish-close");
  const poster = modal?.querySelector(".festival-wish-image");
  poster?.addEventListener("error", () => { poster.hidden = true; });
  if (!modal) return;

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
