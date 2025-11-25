import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { LRUCache } from "lru-cache"; 

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5050;
const API_TOKEN = process.env.AQICN_TOKEN;

// ----- Cache setup -----
const cache = new LRUCache({
  max: 50,             // max 50 cities in cache
  ttl: 1000 * 60 * 10  // cache expiry: 10 minutes
});

// Utility to capitalize each word in city name
function formatCityName(city) {
  return city
    .trim()
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Route to fetch AQI
app.get("/api/aqi/:city", async (req, res) => {
  const rawCity = req.params.city;
  const city = formatCityName(rawCity);

  console.log("Requested city:", city);

  // Check cache first
  if (cache.has(city)) {
    console.log("Returning cached data for", city);
    return res.json(cache.get(city));
  }

  try {
    const url = `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${API_TOKEN}`;
    const response = await axios.get(url);
    const data = response.data;

    if (data.status !== "ok") {
      return res.status(404).json({ error: "City not found or API error" });
    }

    const result = {
      city: data.data.city.name,
      aqi: data.data.aqi,
      dominentpol: data.data.dominentpol,
      iaqi: data.data.iaqi,
      time: data.data.time.s
    };

    // Save result in cache
    cache.set(city, result);

    res.json(result);
  } catch (err) {
    console.error("AQICN fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch AQI data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
