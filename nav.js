const navigationToggle = document.querySelector(".nav-toggle");
const navigationLinks = document.querySelector(".nav-links");
const navigationToggleLabel = navigationToggle?.querySelector(".sr-only");

navigationToggle?.addEventListener("click", () => {
  const isOpen = navigationToggle.getAttribute("aria-expanded") === "true";

  navigationToggle.setAttribute("aria-expanded", String(!isOpen));
  navigationLinks?.classList.toggle("is-open", !isOpen);

  if (navigationToggleLabel) {
    navigationToggleLabel.textContent = isOpen
      ? "Open navigation menu"
      : "Close navigation menu";
  }
});

navigationLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigationToggle?.setAttribute("aria-expanded", "false");
    navigationLinks.classList.remove("is-open");

    if (navigationToggleLabel) {
      navigationToggleLabel.textContent = "Open navigation menu";
    }
  });
});
