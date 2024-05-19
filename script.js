// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(express.json());

app.get('/api/news', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default; // Dynamic import for node-fetch
    const { default: NewsAPI } = await import('newsapi'); // Dynamic import for NewsAPI
    const newsapi = new NewsAPI(process.env.NEWSAPI_KEY);

    const category = req.query.category || null;
    const response = await fetchArticlesByCategory(category, newsapi);
    res.json(response);
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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
