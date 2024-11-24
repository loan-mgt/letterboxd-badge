const express = require('express');
const { generateSvg } = require('./src/svg-utils');
const { fetchLetterboxdRSS, fetchMovieCover } = require('./src/data-fetcher');
const { source } = require('./ressources/source');

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
  res.send('Hello! please use /:username ');
});

app.get('/:username', async (req, res) => {
  const username = req.params.username;
  const result = await fetchLetterboxdRSS(username);
  const backgroundTheme = req.query.theme ?? "classic"

  if (result && result.length > 0) {
    const selectedReview = result[0]; // Get the first review from the array
    console.log('Received request for username: ' + username + ' ' + JSON.stringify(selectedReview));
    const updatedSvgContent = await generateSvg(selectedReview, backgroundTheme, source); 

    res.contentType('image/svg+xml');
    res.setHeader('Cache-Control', 's-max-age=10, stale-while-revalidate');
    res.send(updatedSvgContent);

    console.log('SVG sent successfully.');

  } else {
    res.status(404).send('Failed to retrieve activity details.');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
