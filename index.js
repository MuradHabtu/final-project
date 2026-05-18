const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

app.get("/", (req, res) => {
  res.sendFile("public/index.html", { root: __dirname });
});

/*
  External API Endpoint #1
  Searches TVMaze shows by user query.
*/
app.get("/api/shows/search", async (req, res) => {
  try {
    const query = req.query.q || "friends";

    const response = await fetch(
      `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`,
    );

    const data = await response.json();

    const cleanedData = data.map((item) => ({
      id: item.show.id,
      name: item.show.name,
      genres: item.show.genres,
      rating: item.show.rating?.average || "N/A",
      image:
        item.show.image?.medium ||
        "https://via.placeholder.com/210x295?text=No+Image",
      summary: item.show.summary
        ? item.show.summary.replace(/<[^>]+>/g, "")
        : "No summary available.",
      premiered: item.show.premiered || "Unknown",
      status: item.show.status || "Unknown",
      officialSite: item.show.officialSite || "#",
    }));

    res.json(cleanedData);
  } catch (error) {
    console.error("Search API error:", error);
    res.status(500).json({ message: "Unable to search shows." });
  }
});

/*
  External API Endpoint #2
  Gets shows airing today from TVMaze.
*/
app.get("/api/shows/trending", async (req, res) => {
  try {
    const response = await fetch("https://api.tvmaze.com/schedule?country=US");
    const data = await response.json();

    const cleanedData = data.slice(0, 20).map((item) => ({
      id: item.show.id,
      name: item.show.name,
      genres: item.show.genres,
      rating: item.show.rating?.average || "N/A",
      image:
        item.show.image?.medium ||
        "https://via.placeholder.com/210x295?text=No+Image",
      summary: item.show.summary
        ? item.show.summary.replace(/<[^>]+>/g, "")
        : "No summary available.",
      airtime: item.airtime || "Unknown",
      network:
        item.show.network?.name || item.show.webChannel?.name || "Unknown",
    }));

    res.json(cleanedData);
  } catch (error) {
    console.error("Trending API error:", error);
    res.status(500).json({ message: "Unable to load trending shows." });
  }
});

/*
  Supabase Endpoint #1
  Retrieves saved favorite shows from database.
*/
app.get("/api/favorites", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Favorites GET error:", error);
    res.status(500).json({ message: "Unable to load favorites." });
  }
});

/*
  Supabase Endpoint #2
  Writes a selected favorite show to database.
*/
app.post("/api/favorites", async (req, res) => {
  try {
    const { show_id, name, genres, rating, image_url, summary } = req.body;

    if (!show_id || !name) {
      return res.status(400).json({
        message: "show_id and name are required.",
      });
    }

    const { data, error } = await supabase
      .from("favorites")
      .insert({
        show_id,
        name,
        genres,
        rating,
        image_url,
        summary,
      })
      .select();

    if (error) {
      throw error;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Favorites POST error:", error);
    res.status(500).json({ message: "Unable to save favorite." });
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`ShowFinder is running on port ${port}`);
  });
}

module.exports = app;
