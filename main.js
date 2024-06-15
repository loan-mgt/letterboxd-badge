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
  try {
    const username = req.params.username;
    logger.info(`Received request for username: ${username}`);
    const backgroundTheme = req.query.theme ?? "classic"

    const activityDetails = await fetchLatestActivityDetails(username);

    if (!activityDetails) {
      logger.warn(`Failed to retrieve activity details for username: ${username}`);
      res.status(404).send('Failed to retrieve activity details.');
      return;
    }

    let movieInfo = null;
    if (activityDetails.movieSlug) {
      movieInfo = await fetchMovieCover(activityDetails.movieSlug);
      if (!movieInfo) {
        logger.warn(`Failed to retrieve movie cover URL for username: ${username}`);
        res.status(404).send('Failed to retrieve movie cover URL.');
        return;
      }
    }


    const updatedSvgContent = await generateSvg(
      activityDetails.filmTitle,
      movieInfo?.year || activityDetails.filmYear,
      activityDetails.stars,
      movieInfo?.movieCoverUrl,
      activityDetails.redirectUrl,
      activityDetails.ago,
      backgroundTheme
    );

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
