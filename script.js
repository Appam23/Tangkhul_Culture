function filterCultureCards(searchTerm) {
  const cards = document.querySelectorAll(".culture-card");
  const status = document.querySelector("#search-status");
  const normalizedTerm = searchTerm.trim().toLowerCase();
  let visibleCards = 0;

  cards.forEach((card) => {
    const searchableText = card.textContent.toLowerCase();
    const matches = !normalizedTerm || searchableText.includes(normalizedTerm);

    card.hidden = !matches;
    if (matches) {
      visibleCards += 1;
    }
  });

  if (!normalizedTerm) {
    status.textContent = "";
  } else if (visibleCards === 0) {
    status.textContent = `No cultural topics found for “${searchTerm.trim()}”.`;
  } else {
    status.textContent = `${visibleCards} cultural topic${visibleCards === 1 ? "" : "s"} found.`;
  }
}

document
  .querySelector("#culture-search-input")
  .addEventListener("input", (event) => {
    filterCultureCards(event.target.value);
  });
