const express = require('express');
const { generateSvg } = require('./svgUtils');
const { fetchLatestActivityDetails, fetchMovieCover } = require('./dataFetcher');

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
  res.send('Hello! please use /:username ');
});

app.get('/:username', async (req, res) => {
  const username = req.params.username;
  const result = await fetchLatestActivityDetails(username);
  const backgroundTheme = req.query.theme ?? "classic"

  if (result) {
    let newFilmCoverURL = null
    if (result.movieSlug != null) {
      movieInfo = await fetchMovieCover(result.movieSlug); 
    }else{
      res.status(404).send('Failed to retrieve movie cover URL.');
      return
    }
    const updatedSvgContent = await generateSvg(result.filmTitle, movieInfo.year, result.stars, movieInfo.movieCoverUrl, result.redirectUrl, result.ago, backgroundTheme); 

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
