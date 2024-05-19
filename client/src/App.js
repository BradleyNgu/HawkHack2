import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import MapComponent from './MapComponent';

function App() {
  const [category, setCategory] = useState('');
  const [articles, setArticles] = useState([]);
  const [markers, setMarkers] = useState([]);

  const generateRandomOffset = () => {
    return (Math.random()/6);
  };

  const fetchArticles = async (category) => {
    try {
      const response = await axios.get(`/api/news?category=${category}`);
      setArticles(response.data);
      setMarkers(response.data.map(article => {
        const latitudeOffset = generateRandomOffset();
        const longitudeOffset = generateRandomOffset();
        return {
          title: article.Title,
          summary: article.Summary,
          url: article.URL,
          location: article.Location,
          latitude: article.Latitude + latitudeOffset,
          longitude: article.Longitude + longitudeOffset
        };
      }));
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  useEffect(() => {
    fetchArticles('');
  }, []);

  const handleSearch = () => {
    fetchArticles(category);
  };

  const handleClear = () => {
    setCategory('');
    fetchArticles('');
  };

  return (
    <div className="App">
      <MapComponent markers={markers} />
      <div>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Enter category (e.g., business)"
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleClear}>Clear</button>
      </div>
      <div id="articles-container">
        {articles.map((article, index) => (
          <div key={index} className="article">
            <h2>{article.Title}</h2>
            <p>{article.Summary}</p>
            <p>Location: {article.Location} (Lat: {article.Latitude}, Lng: {article.Longitude})</p>
            <a href={article.URL} target="_blank" rel="noopener noreferrer">Read more</a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
