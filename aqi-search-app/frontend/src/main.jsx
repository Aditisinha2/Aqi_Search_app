import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const getAqiColor = (aqi) => {
  if (aqi <= 50) return "#2ecc71"; // Good
  if (aqi <= 100) return "#f1c40f"; // Moderate
  if (aqi <= 150) return "#e67e22"; // Unhealthy for sensitive
  if (aqi <= 200) return "#e74c3c"; // Unhealthy
  if (aqi <= 300) return "#8e44ad"; // Very Unhealthy
  return "#7f0000"; // Hazardous
};

const SearchBar = ({ city, setCity, onSearch }) => (
  <form onSubmit={onSearch} className="search-bar">
    <input
      type="text"
      placeholder="Enter city"
      value={city}
      onChange={(e) => setCity(e.target.value)}
    />
    <button type="submit">Search</button>
  </form>
);

const AqiCard = ({ city, aqi, dominentpol }) => (
  <div className="aqi-card">
    <h2>{city}</h2>
    <div className="aqi-indicator" style={{ backgroundColor: getAqiColor(aqi) }}>
      {aqi}
    </div>
    <p><strong>Dominant Pollutant:</strong> {dominentpol}</p>
  </div>
);

const AqiDetails = ({ iaqi, time }) => (
  <div className="aqi-details">
    <h3>Pollutants:</h3>
    <div className="pollutant-grid">
      {iaqi &&
        Object.entries(iaqi).map(([key, val]) => (
          <div key={key} className="pollutant-box">
            <strong>{key.toUpperCase()}</strong>
            <span>{val.v}</span>
          </div>
        ))}
    </div>
    <p className="last-updated"><strong>Last Updated:</strong> {time}</p>
  </div>
);

const App = () => {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city) return;

    setError("");
    setData(null);
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5050/api/aqi/${city}`);
      if (!res.ok) throw new Error("City not found or API error");
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>AQI Search Engine</h1>
      <SearchBar city={city} setCity={setCity} onSearch={handleSearch} />

      {loading && <p className="loading">Fetching data...</p>}
      {error && <p className="error">{error}</p>}

      {data && (
        <>
          <AqiCard city={data.city} aqi={data.aqi} dominentpol={data.dominentpol} />
          <AqiDetails iaqi={data.iaqi} time={data.time} />
        </>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
