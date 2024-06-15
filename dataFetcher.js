const axios = require('axios');
const cheerio = require('cheerio');

const LETTERBOXD_BASE_URL = "https://letterboxd.com";
async function fetchLatestActivityDetails(username) {
  const activityUrl = `${LETTERBOXD_BASE_URL}/ajax/activity-pagination/${username}`;

  try {
    const response = await axios.get(activityUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    const latestActivitySection = findLatestActivitySection($);

    if (!latestActivitySection) {
      console.warn(`No latest activity section found for username: ${username}`);
      return null;
    }

    const activityDetails = parseActivitySection($, latestActivitySection, username);

    return activityDetails;
  } catch (error) {
    console.error(`Error fetching data for username ${username}: ${error.message}`);
    return null;
  }
}

async function fetchMovieCover(movieSlug) {
  const filmCoverUrl = `${LETTERBOXD_BASE_URL}/ajax/poster/film/${movieSlug}/hero/560611/150x225/`;

  try {
    const response = await axios.get(filmCoverUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    const movieCoverUrl = $('img.image:not(hidden)').attr('src');
    const year = $('div.film-poster').data('film-release-year');
    
    return { movieCoverUrl, year };
  } catch (error) {
    console.error(`Error fetching movie cover for movieSlug ${movieSlug}: ${error.message}`);
    return null;
  }
}

function findLatestActivitySection($) {
  let latestActivitySection = null;

  $('.activity-row').each((index, element) => {
    const ratingText = $(element).find('.activity-summary > span.rating').text().trim();

    if (ratingText) {
      latestActivitySection = $(element);
      return false;
    }
  });

  return latestActivitySection;
}

function parseActivitySection($, latestActivitySection, username) {
  let filmTitle = latestActivitySection.find('.headline-2 > a').text().trim();
  let filmYear = latestActivitySection.find('.headline-2 > small > a').text().trim();
  let stars = latestActivitySection.find('.film-detail-meta .rating').text().trim();
  const ago = latestActivitySection.find('time').attr('datetime');

  const movieSlug = findMovieSlug($, latestActivitySection);

  let redirectUrl = `${LETTERBOXD_BASE_URL}${username}/film/${movieSlug}`;

  if (!filmTitle) {
    filmTitle = latestActivitySection.find('.activity-summary > a.target').text().trim();
    stars = latestActivitySection.find('.activity-summary > span.rating').text().trim();
    redirectUrl = `${LETTERBOXD_BASE_URL}${username}`;
  }

  console.debug(`Film title for username ${username}: ${filmTitle}`);
  console.debug(`Film year for username ${username}: ${filmYear}`);
  console.debug(`Stars for username ${username}: ${stars}`);
  console.debug(`Movie slug for username ${username}: ${movieSlug}`);
  console.debug(`Redirect URL for username ${username}: ${redirectUrl}`);
  console.debug(`Ago for username ${username}: ${ago}`);

  return { filmTitle, filmYear, stars, movieSlug, redirectUrl, ago };
}

function findMovieSlug($, latestActivitySection) {
  let movieSlug = null;

  latestActivitySection.find('a').each((index, element) => {
    const href = $(element).attr('href');

    if (href && href.includes('film/')) {
      movieSlug = href.split('film/')[1].split('/')[0];
    }
  });

  return movieSlug;
}

module.exports = { fetchLatestActivityDetails, fetchMovieCover };
