const express = require('express');
const { logger } = require('./logger');
const { generateSvg } = require('./svgUtils');
const { fetchLatestActivityDetails, fetchMovieCover } = require('./dataFetcher');

const app = express();
const port = 3000;



app.get('/', async (req, res) => {
  logger.info('Received a request for the root path. Please use /:username.');
  res.send('Hello! Please use /:username ');
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

    logger.info(`SVG sent successfully for username: ${username}`);
  } catch (error) {
    logger.error(`Error processing request for username ${req.params.username}: ${error.message}`);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  
  logger.info(`Server is running at http://localhost:${port} environment: ${process.env.ENVIRONMENT}`);
});
