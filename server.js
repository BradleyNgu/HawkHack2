// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Log the API keys to check if they are loaded correctly (remove this in production)
console.log('NEWSAPI_KEY:', process.env.NEWSAPI_KEY);
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);
console.log('GOOGLE_MAPS_API_KEY:', process.env.GOOGLE_MAPS_API_KEY);

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(express.json());

app.get('/api/news', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default; // Dynamic import for node-fetch
    const { default: NewsAPI } = await import('newsapi'); // Dynamic import for NewsAPI
    const newsapi = new NewsAPI(process.env.NEWSAPI_KEY);

    const category = req.query.category || null;
    const response = await fetchArticlesByCategory(category, newsapi, fetch);
    const processedArticles = await processArticles(response, fetch);
    res.json(processedArticles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function fetchArticlesByCategory(category, newsapi) {
  const response = await newsapi.v2.topHeadlines({
    country: 'ca',
    category: category || undefined,
    language: 'en'
  });

  if (response.status === "ok") {
    return response.articles;
  } else {
    throw new Error(`Error fetching news for category ${category}: ${response}`);
  }
}

async function processArticles(articles, fetch) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  const articlesList = [];

  for (const article of articles) {
    try {
      const summary = await getOpenAISummary(article.content || article.description, openaiApiKey, fetch);
      const location = extractLocationFromSummary(summary);
      const coordinates = await getCityCoordinates(location, googleMapsApiKey, fetch);

      const articleObject = {
        Title: article.title,
        Summary: summary,
        URL: article.url,
        Location: location,
        Latitude: coordinates.latitude,
        Longitude: coordinates.longitude
      };

      articlesList.push(articleObject);
    } catch (error) {
      console.error("Error processing article:", error);
    }
  }

  return articlesList;
}

async function getOpenAISummary(content, apiKey, fetch) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: `Summarize the following news article and make sure the first word is the name of the city where the article takes place. The first word MUST be the city name without any prepositions or other words before it.:\n\n${content}\n\nSummary:` } 
      ],
      max_tokens: 150,
      temperature: 0.7,
    })
  });

  const data = await response.json();

  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content.trim();
  } else {
    console.error('OpenAI API error response:', data); // Log the error response
    throw new Error("Invalid response from OpenAI API");
  }
}

async function getCityCoordinates(city, apiKey, fetch) {
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`);
  const data = await response.json();

  if (data.status === "OK" && data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return {
      latitude: location.lat,
      longitude: location.lng
    };
  } else {
    throw new Error(`Geocoding API error: ${data.status}`);
  }
}

function extractLocationFromSummary(summary) {
  const cityPattern = /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/;
  const match = summary.match(cityPattern);
  return match ? match[0] : 'Unknown';
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
