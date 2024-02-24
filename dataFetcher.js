const axios = require('axios');
const cheerio = require('cheerio');

const mainUrl = "https://letterboxd.com/"


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
    let movieSlug = null;

    latestActivitySection.find('a').each((index, element) => {
      const href = $(element).attr('href');
      
      // Check if the href contains "film/content/"
      if (href && href.includes('film/')) {
        // Extract the content between "film/content/" and "/"
        movieSlug = href.split('film/')[1].split('/')[0];
      }
    });




    return { title: filmTitle, filmYear, stars, movieSlug, redirectUrl: `${mainUrl}${username}/film/${movieSlug}` };
  } catch (error) {
    console.error('Error fetching data:', error.message);
    return null;
  }
}


async function getMovieCover(movieSlug){
  const filmCoverUrl = `https://letterboxd.com/ajax/poster/film/${movieSlug}/hero/560611/150x225/`

  try {
    const response = await axios.get(filmCoverUrl);
    const html = response.data;
    const $ = cheerio.load(html);
    const movieCoverUrl = $('img.image:not(hidden)').attr('src');

    return movieCoverUrl;
  } catch (error) {
    console.error('Error fetching movie cover:', error.message);
    return null;
  }
}

module.exports = { getLatestActivityDetails, getMovieCover };
