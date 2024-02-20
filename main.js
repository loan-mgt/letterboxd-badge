const express = require('express');
const { generateUpdatedSvg } = require('./svgUtils');
const { getLatestActivityDetails } = require('./dataFetcher');

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
  res.send('Hello! please use /:username ');
});

app.get('/:username', async (req, res) => {
  const username = req.params.username;
  const result = await getLatestActivityDetails(username);

  if (result) {
    const newFilmCoverURL = 'https://a.ltrbxd.com/resized/film-poster/8/7/9/3/2/0/879320-the-deep-dark-0-70-0-105-crop.jpg?v=d923579b15';
    const updatedSvgContent = generateUpdatedSvg(result.title, result.filmYear, result.stars, newFilmCoverURL);

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
