// Load environment variables from .env file
require('dotenv').config();

(async () => {
  const fetch = (await import('node-fetch')).default;

  const NewsAPI = require('newsapi');
  const newsapi = new NewsAPI(process.env.NEWSAPI_KEY);
  const openaiApiKey = process.env.OPENAI_KEY;
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

  let articlesList = [];

  async function getOpenAISummary(content) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `Summarize the following news article and make sure the first word is the name of the city where the article takes place. The first word MUST be the city name without any prepositions or other words before it. If you don't know the city, pick a random one in Ontario:\n\n${content}\n\nSummary:` }
        ],
        max_tokens: 150,
        temperature: 0.7,
      })
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error("Invalid response from OpenAI API");
    }
  }


  //getting cords
  async function getCityCoordinates(city) {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${googleMapsApiKey}`);
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



  // Fetch top headlines in the CA
  newsapi.v2.topHeadlines({
    country: 'ca',
    category: 'business',
    language: 'en'
  }).then(async response => {
    if (response.status === "ok") {
      await processArticles(response.articles);
      printArticles(articlesList);
    } else {
      console.error("Error fetching news:", response);
    }
  }).catch(error => {
    console.error("Error fetching news:", error);
  });

  async function processArticles(articles) {
    for (const article of articles) {
      try {
        /*console.log(`Title: ${article.title}`);
        console.log(`Author: ${article.author || 'Unknown'}`);
        console.log(`URL: ${article.url}`);
        console.log('-----------------------------');*/

        const summary = await getOpenAISummary(article.content || article.description);
        //console.log(`Summary: ${summary}`);

        const location = extractLocationFromSummary(summary);
        //console.log(`Location: ${location}`);

        const coordinates = await getCityCoordinates(location);


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
  }

  function extractLocationFromSummary(summary) {
    const cityPattern = /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/;
    const match = summary.match(cityPattern);
    return match ? match[0] : 'Unknown';
  }

  function printArticles(articles) {
    articles.forEach(article => {
      console.log(`Name: ${article.Title}`);
      console.log(`Location: ${article.Location}`);
      console.log(`Latitude: ${article.Latitude}`);
      console.log(`Longitude: ${article.Longitude}`);
      console.log(`Link: ${article.URL}`);
      console.log(`Summary: ${article.Summary}`);
      console.log('-----------------------------');
    });
  }
})();
