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
  let filmTitle, filmYear, stars, redirectUrl, ago;

  const summary = latestActivitySection.find('.activity-summary');
  const nameLink = summary.find('a.name').attr('href');
  const targetLink = summary.find('a.target').attr('href');
  const contextSpan = summary.find('span.context');
  const time = latestActivitySection.find('time').attr('datetime');

  if (contextSpan.length > 0) {
    filmTitle = contextSpan.next().text().trim();
    stars = contextSpan.parent().find('span.rating').text().trim();
    redirectUrl = `${LETTERBOXD_BASE_URL}${nameLink}`;
  } else {
    filmTitle = summary.find('a.target').text().trim();
    stars = summary.find('span.rating').text().trim();
    redirectUrl = `${LETTERBOXD_BASE_URL}${targetLink}`;
  }

  ago = time || summary.find('span.nobr').text().trim();
  
  const movieSlug = findMovieSlug($, latestActivitySection);

  console.debug(`Film title for username ${username}: ${filmTitle}`);
  console.debug(`Stars for username ${username}: ${stars}`);
  console.debug(`Movie slug for username ${username}: ${movieSlug}`);
  console.debug(`Redirect URL for username ${username}: ${redirectUrl}`);
  console.debug(`Ago for username ${username}: ${ago}`);

  return { filmTitle, stars, movieSlug, redirectUrl, ago };
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
