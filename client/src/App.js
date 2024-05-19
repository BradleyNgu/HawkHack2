import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import MapComponent from './MapComponent';

function App() {
  const [category, setCategory] = useState('');
  const [articles, setArticles] = useState([]);
  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);

  const generateRandomOffset = () => {
    return (Math.random()/15);
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


  const handleFocusOnMarker = (marker) => {
    mapRef.current.focusOnMarker(marker);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the top of the page
  };


  return (
    <div className="App">
      <header className="App-header">
          <img src="/logo.png" alt="NewsBuzz Logo" className="App-logo" />
          <h1>NewsBuzz</h1>
      </header>
      <MapComponent ref={mapRef} markers={markers} />
      <div className="search-bar">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="business">Business</option>
          <option value="entertainment">Entertainment</option>
          <option value="health">Health</option>
          <option value="science">Science</option>
          <option value="sports">Sports</option>
          <option value="technology">Technology</option>
        </select>
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleClear}>Clear</button>
      </div>
      <div id="articles-container">
        {articles.map((article, index) => (
          <div key={index} className="article" onClick={() => handleFocusOnMarker(markers[index])}>
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
