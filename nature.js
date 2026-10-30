/* ===== NATURE EXPLORER ELEMENTS ===== */

const naturePlaceForm = document.querySelector("#nature-place-form");
const natureSearch = document.querySelector("#nature-place-search");
const natureSelect = document.querySelector("#nature-place-select");
const natureIdentificationForm = document.querySelector(
  "#nature-identification-form"
);
const natureStatus = document.querySelector("#nature-status");
const natureResults = document.querySelector("#nature-results");

/* ===== SEARCH FOR PLACES ===== */

naturePlaceForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const searchTerm = natureSearch.value.trim();

  if (searchTerm.length < 2) {
    natureStatus.textContent = "Enter at least two characters.";
    return;
  }

  const button = naturePlaceForm.querySelector("button");
  button.disabled = true;

  natureIdentificationForm.hidden = true;
  natureSelect.replaceChildren();
  natureResults.replaceChildren();
  natureStatus.textContent = "Searching for places...";

  try {
    const parameters = new URLSearchParams({ q: searchTerm });

    const response = await fetch(
      `https://api.inaturalist.org/v1/places/autocomplete?${parameters}`
    );

    if (!response.ok) {
      throw new Error(`Place search failed (${response.status}).`);
    }

    const data = await response.json();

    if (data.results.length === 0) {
      natureStatus.textContent =
        "No places found. Try Manipur or another place.";
      return;
    }

    for (const place of data.results) {
      const option = document.createElement("option");
      option.value = place.id;
      option.textContent = place.display_name || place.name;
      natureSelect.append(option);
    }

    natureIdentificationForm.hidden = false;
    natureStatus.textContent =
      "Select a place and choose optional observation dates.";
  } catch (error) {
    natureStatus.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

/* ===== FIND IDENTIFICATIONS ===== */

natureIdentificationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const start = document.querySelector("#nature-start-date").value;
  const end = document.querySelector("#nature-end-date").value;

  if (start && end && start > end) {
    natureStatus.textContent =
      "The start date must be on or before the end date.";
    return;
  }

  const buttons = document.querySelectorAll(".nature-explorer button");
  buttons.forEach((button) => {
    button.disabled = true;
  });

  natureResults.replaceChildren();
  natureStatus.textContent = "Loading plants and wildlife...";

  try {
    const parameters = new URLSearchParams({
      place_id: natureSelect.value,
      per_page: 100,
      current: "true"
    });

    if (start) parameters.set("observed_d1", start);
    if (end) parameters.set("observed_d2", end);

    const response = await fetch(
      `https://api.inaturalist.org/v1/identifications?${parameters}`
    );

    if (!response.ok) {
      throw new Error(`Identification search failed (${response.status}).`);
    }

    const data = await response.json();

    // Keep each taxon ID only once.
    const taxonIds = [
      ...new Set(
        data.results
          .map((identification) => identification.taxon?.id)
          .filter((id) => id != null)
      )
    ];

    if (taxonIds.length === 0) {
      natureStatus.textContent =
        "No identifications found. Try another place or date range.";
      return;
    }

    // Request names and photographs in small groups.
    const taxa = [];

    for (let i = 0; i < taxonIds.length; i += 20) {
      const batch = taxonIds.slice(i, i + 20);

      const taxaResponse = await fetch(
        `https://api.inaturalist.org/v1/taxa/${batch.join(",")}`
      );

      if (!taxaResponse.ok) {
        throw new Error(`Species details failed (${taxaResponse.status}).`);
      }

      const taxaData = await taxaResponse.json();
      taxa.push(...taxaData.results);
    }

    for (const taxon of taxa) {
      createNatureCard(taxon);
    }

    const placeName = natureSelect.selectedOptions[0].textContent;

    natureStatus.textContent =
      `Showing ${taxa.length} unique taxa in ${placeName}, ` +
      `from ${data.results.length} identification records.`;
  } catch (error) {
    natureStatus.textContent = error.message;
  } finally {
    buttons.forEach((button) => {
      button.disabled = false;
    });
  }
});

/* ===== CREATE A NATURE CARD ===== */

function createNatureCard(taxon) {
  const card = document.createElement("article");
  card.className = "nature-card";

  const name =
    taxon.preferred_common_name || taxon.name || `Taxon ${taxon.id}`;

  const photo = taxon.default_photo;
  const photoUrl = photo?.medium_url || photo?.url;

  if (photoUrl) {
    const image = document.createElement("img");
    image.src = photoUrl;
    image.alt = name;
    image.loading = "lazy";

    image.addEventListener("error", () => {
      const message = document.createElement("p");
      message.textContent = "Image unavailable";
      image.replaceWith(message);
    }, { once: true });

    card.append(image);
  }

  const content = document.createElement("div");
  content.className = "nature-card-content";

  const heading = document.createElement("h3");
  heading.textContent = name;
  content.append(heading);

  if (taxon.name) {
    const scientificName = document.createElement("p");
    const italic = document.createElement("em");
    italic.textContent = taxon.name;
    scientificName.append(italic);
    content.append(scientificName);
  }

  const link = document.createElement("a");
  link.href = `https://www.inaturalist.org/taxa/${taxon.id}`;
  link.textContent = "View on iNaturalist";
  content.append(link);

  if (photo?.attribution) {
    const credit = document.createElement("p");
    credit.className = "nature-photo-credit";
    credit.textContent = photo.attribution;
    content.append(credit);
  }

  card.append(content);
  natureResults.append(card);
}