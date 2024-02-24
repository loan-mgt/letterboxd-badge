const express = require('express');
const { generateSvg } = require('./svgUtils');
const { getLatestActivityDetails, getMovieCover } = require('./dataFetcher');

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
  res.send('Hello! please use /:username ');
});

app.get('/:username', async (req, res) => {
  const username = req.params.username;
  const result = await getLatestActivityDetails(username);

  if (result) {
    let newFilmCoverURL = null
    if (result.movieSlug != null) {
      newFilmCoverURL = await getMovieCover(result.movieSlug); 
    }else{
      res.status(404).send('Failed to retrieve movie cover URL.');
      return
    }
    const updatedSvgContent = await generateSvg(result.title, result.filmYear, result.stars, newFilmCoverURL, result.redirectUrl); 

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
