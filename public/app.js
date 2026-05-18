let ratingChart = null;

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const trendingShows = document.getElementById("trendingShows");
const favoriteShows = document.getElementById("favoriteShows");
const loadTrendingBtn = document.getElementById("loadTrendingBtn");
const loadFavoritesBtn = document.getElementById("loadFavoritesBtn");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();

  if (!query) {
    return;
  }

  await searchShows(query);
});

loadTrendingBtn.addEventListener("click", loadTrendingShows);
loadFavoritesBtn.addEventListener("click", loadFavorites);

async function searchShows(query) {
  searchResults.innerHTML = "<p>Loading search results...</p>";

  try {
    const response = await fetch(
      `/api/shows/search?q=${encodeURIComponent(query)}`,
    );
    const shows = await response.json();

    displayShows(shows, searchResults);
    updateRatingChart(shows);
  } catch (error) {
    console.error("Search error:", error);
    searchResults.innerHTML = "<p>Unable to load search results.</p>";
  }
}

async function loadTrendingShows() {
  trendingShows.innerHTML =
    "<div class='swiper-slide'>Loading trending shows...</div>";

  try {
    const response = await fetch("/api/shows/trending");
    const shows = await response.json();

    trendingShows.innerHTML = "";

    shows.forEach((show) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      slide.innerHTML = createShowCard(show);
      trendingShows.appendChild(slide);
    });

    activateFavoriteButtons();

    new Swiper(".swiper", {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        700: {
          slidesPerView: 2,
        },
        1000: {
          slidesPerView: 3,
        },
      },
    });
  } catch (error) {
    console.error("Trending error:", error);
    trendingShows.innerHTML =
      "<div class='swiper-slide'>Unable to load trending shows.</div>";
  }
}

async function loadFavorites() {
  favoriteShows.innerHTML = "<p>Loading favorites...</p>";

  try {
    const response = await fetch("/api/favorites");
    const favorites = await response.json();

    if (!favorites.length) {
      favoriteShows.innerHTML = "<p>No favorites saved yet.</p>";
      return;
    }

    const formattedFavorites = favorites.map((favorite) => ({
      id: favorite.show_id,
      name: favorite.name,
      genres: favorite.genres ? favorite.genres.split(", ") : [],
      rating: favorite.rating || "N/A",
      image:
        favorite.image_url ||
        "https://via.placeholder.com/210x295?text=No+Image",
      summary: favorite.summary || "No summary available.",
    }));

    displayShows(formattedFavorites, favoriteShows, false);
  } catch (error) {
    console.error("Favorites error:", error);
    favoriteShows.innerHTML = "<p>Unable to load favorites.</p>";
  }
}

function displayShows(shows, container, showSaveButton = true) {
  container.innerHTML = "";

  if (!shows.length) {
    container.innerHTML = "<p>No shows found.</p>";
    return;
  }

  shows.forEach((show) => {
    const card = document.createElement("article");
    card.className = "show-card";
    card.innerHTML = createShowCard(show, showSaveButton);
    container.appendChild(card);
  });

  activateFavoriteButtons();
}

function createShowCard(show, showSaveButton = true) {
  const genres = Array.isArray(show.genres)
    ? show.genres.join(", ")
    : show.genres;

  return `
    <img src="${show.image}" alt="${show.name} poster" />
    <div class="show-card-content">
      <h3>${show.name}</h3>
      <p><strong>Genres:</strong> ${genres || "N/A"}</p>
      <p><strong>Rating:</strong> ${show.rating || "N/A"}</p>
      <p>${show.summary || "No summary available."}</p>
      ${
        showSaveButton
          ? `<button 
              class="favorite-btn"
              data-id="${show.id}"
              data-name="${encodeURIComponent(show.name)}"
              data-genres="${encodeURIComponent(genres || "")}"
              data-rating="${show.rating === "N/A" ? "" : show.rating}"
              data-image="${encodeURIComponent(show.image)}"
              data-summary="${encodeURIComponent(show.summary || "")}"
            >
              Save Favorite
            </button>`
          : ""
      }
    </div>
  `;
}

function activateFavoriteButtons() {
  const buttons = document.querySelectorAll(".favorite-btn");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const favorite = {
        show_id: Number(button.dataset.id),
        name: decodeURIComponent(button.dataset.name),
        genres: decodeURIComponent(button.dataset.genres),
        rating: button.dataset.rating ? Number(button.dataset.rating) : null,
        image_url: decodeURIComponent(button.dataset.image),
        summary: decodeURIComponent(button.dataset.summary),
      };

      await saveFavorite(favorite);
    });
  });
}

async function saveFavorite(favorite) {
  try {
    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(favorite),
    });

    if (!response.ok) {
      throw new Error("Favorite was not saved.");
    }

    alert(`${favorite.name} was saved to favorites.`);
    await loadFavorites();
  } catch (error) {
    console.error("Save favorite error:", error);
    alert("Unable to save favorite.");
  }
}

function updateRatingChart(shows) {
  const chartCanvas = document.getElementById("ratingChart");

  const chartShows = shows.filter((show) => show.rating !== "N/A").slice(0, 8);

  const labels = chartShows.map((show) => show.name);
  const ratings = chartShows.map((show) => Number(show.rating));

  if (ratingChart) {
    ratingChart.destroy();
  }

  ratingChart = new Chart(chartCanvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "TVMaze Rating",
          data: ratings,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
        },
      },
    },
  });
}

window.onload = async () => {
  await loadTrendingShows();
  await searchShows("friends");
  await loadFavorites();
};
