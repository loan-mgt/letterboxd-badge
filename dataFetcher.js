const axios = require('axios');
const cheerio = require('cheerio');

async function getLatestActivityDetails(username) {
  const activityUrl = `https://letterboxd.com/ajax/activity-pagination/${username}`;
  try {
    const response = await axios.get(activityUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    const latestActivitySection = $('.activity-row.-review').first();
    const filmTitle = latestActivitySection.find('.headline-2 > a').text().trim();
    const filmYear = latestActivitySection.find('.headline-2 > small > a').text().trim();
    const stars = latestActivitySection.find('.film-detail-meta .rating').text().trim();

    return { title: filmTitle, filmYear, stars };
  } catch (error) {
    console.error('Error fetching data:', error.message);
    return null;
  }
}

module.exports = { getLatestActivityDetails };
