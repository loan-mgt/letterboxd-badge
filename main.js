const express = require('express');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

const svgFilePath = 'source.svg';

function generateUpdatedSvg(svgFilePath, newTitle, newDate, newStars, newFilmCoverURL) {
  // Read the SVG file
  const svgFile = fs.readFileSync(svgFilePath, 'utf-8');

  // Load the SVG content into Cheerio
  const $ = cheerio.load(svgFile, { xmlMode: true });

  // Update film title, date, and stars
  $('#title tspan').text(newTitle);
  $('#date tspan').text(newDate); // Update the year
  $('#starts tspan').text(newStars); // Update the stars

  // Update film cover image
  $('#film_cover_small').attr('xlink:href', newFilmCoverURL);

  // Return the modified SVG content
  return $.xml();
}

async function getLatestActivityDetails(username) {
  const activityUrl = `https://letterboxd.com/ajax/activity-pagination/${username}`;
  try {
    // Fetch the HTML content from the provided URL
    const response = await axios.get(activityUrl);
    const html = response.data;

    // Load the HTML content into Cheerio
    const $ = cheerio.load(html);

    // Find the latest activity section
    const latestActivitySection = $('.activity-row.-review').first();

    // Extract film details from the latest activity
    const filmTitle = latestActivitySection.find('.headline-2 > a').text().trim();
    const filmYear = latestActivitySection.find('.headline-2 > small > a').text().trim();
    const stars = latestActivitySection.find('.film-detail-meta .rating').text().trim();

    // Return the extracted details as an object
    return {
      title: filmTitle,
      filmYear: filmYear,
      stars: stars,
    };
  } catch (error) {
    console.error('Error fetching data:', error.message);
    return null;
  }
}

app.get('/:username', async (req, res) => {
  const username = req.params.username;

  const result = await getLatestActivityDetails(username);

  if (result) {
    const newFilmCoverURL = 'https://a.ltrbxd.com/resized/film-poster/8/7/9/3/2/0/879320-the-deep-dark-0-70-0-105-crop.jpg?v=d923579b15';

    const updatedSvgContent = generateUpdatedSvg(svgFilePath, result.title, result.filmYear, result.stars, newFilmCoverURL);

    // Set the response content type to SVG
    res.contentType('image/svg+xml');
    
    // Send the modified SVG content as the response
    res.send(updatedSvgContent);

    console.log('SVG sent successfully.');
  } else {
    res.status(404).send('Failed to retrieve activity details.');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
