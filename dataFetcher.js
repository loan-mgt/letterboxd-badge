const axios = require('axios');
const cheerio = require('cheerio');

const mainUrl = "https://letterboxd.com/"


async function getLatestActivityDetails(username) {
  const activityUrl = `https://letterboxd.com/ajax/activity-pagination/${username}`;
  try {
    const response = await axios.get(activityUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    let latestActivitySection = null;
    $('.activity-row').each((index, element) => {
      const ratingText = $(element).find('.activity-summary > span.rating').text().trim();
      if (ratingText) {
        latestActivitySection = $(element);
        return false; 
      }
    });

    if (!latestActivitySection) {
      return null;
    }

    let filmTitle = latestActivitySection.find('.headline-2 > a').text().trim();
    let filmYear = latestActivitySection.find('.headline-2 > small > a').text().trim();
    let stars = latestActivitySection.find('.film-detail-meta .rating').text().trim();
    const ago = latestActivitySection.find('time').attr('datetime');

    let movieSlug = null;

    latestActivitySection.find('a').each((index, element) => {
      const href = $(element).attr('href');
      
      if (href && href.includes('film/')) {
        movieSlug = href.split('film/')[1].split('/')[0];
      }
    });
    let redirectUrl = `${mainUrl}${username}/film/${movieSlug}`

    if (!filmTitle) {
      filmTitle = latestActivitySection.find('.activity-summary > a.target').text().trim();
      stars = latestActivitySection.find('.activity-summary > span.rating').text().trim();
      redirectUrl = `${mainUrl}${username}`
    }
    


    
    
    
    




    return { title: filmTitle, filmYear, stars, movieSlug, redirectUrl, ago };
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
    const year = $('div.film-poster').data('film-release-year');

    return {movieCoverUrl,year};
  } catch (error) {
    console.error('Error fetching movie cover:', error.message);
    return null;
  }
}

module.exports = { getLatestActivityDetails, getMovieCover };
