const axios = require('axios');
const xml2js = require('xml2js');
const cheerio = require('cheerio');

const LETTERBOXD_RSS_URL = "https://letterboxd.com";

/**
 * Fetch and parse the RSS feed for a given username.
 * @param {string} username - Letterboxd username.
 * @returns {Promise<Array<{
 *   filmTitle: string, // Title of the film
 *   year: string, // Year of release
 *   stars: string, // User's star rating (e.g., "★★★★")
 *   link: string, // Link to the review on Letterboxd
 *   watchedDate: string, // Date the film was watched
 *   rewatch: string, // "Yes" or "No" indicating if this was a rewatch
 *   memberRating: string, // User's numerical rating for the film (e.g., "4.0")
 *   tmdbId: string, // The TMDb ID of the film
 *   description: string, // Full HTML description of the review
 *   filmCover: string | null, // URL to the film cover image, or null if not available
 *   creator: string // Name of the review creator (usually the username)
 * }>>} - Parsed reviews as an array of objects.
 */
async function fetchLetterboxdRSS(username) {
  const rssUrl = `${LETTERBOXD_RSS_URL}/${username}/rss/`;

  try {
    // Fetch RSS feed
    const response = await axios.get(rssUrl, { headers: { Accept: 'application/rss+xml' } });
    const rssData = response.data;

    // Parse RSS feed
    const parsedData = await xml2js.parseStringPromise(rssData, { explicitArray: false });
    const items = parsedData.rss.channel.item;

    // Normalize items to always be an array
    const reviews = Array.isArray(items) ? items : [items];

    // Map the reviews into a more convenient format
    return reviews.map((review) => {
      const { filmTitle, year, stars } = parseTitle(review.title);

      return {
        filmTitle,
        year,
        stars,
        link: review.link,
        watchedDate: review["letterboxd:watchedDate"],
        rewatch: review["letterboxd:rewatch"],
        memberRating: review["letterboxd:memberRating"],
        tmdbId: review["tmdb:movieId"],
        description: review.description,
        filmCover: extractFilmCover(review.description),
        creator: review["dc:creator"],
      };
    });
  } catch (error) {
    console.error(`Error fetching RSS feed for username ${username}: ${error.message}`);
    return null;
  }
}

/**
 * Extract the film cover image URL from the description field.
 * @param {string} description - The HTML content of the description field.
 * @returns {string|null} - The URL of the film cover image, or null if not found.
 */
function extractFilmCover(description) {
  if (!description) return null;

  // Load the description as HTML using cheerio
  const $ = cheerio.load(description);
  
  // Find the <img> tag and get the src attribute
  const imgSrc = $('img').attr('src');
  
  return imgSrc || null;
}

/**
 * Parse the title to extract the film title, year, and stars.
 * @param {string} title - Title string in the format "Film Title, Year - ★★★★".
 * @returns {{filmTitle: string, year: string, stars: string}} - Extracted film title, year, and stars.
 */
function parseTitle(title) {
  const titleRegex = /^(.*), (\d+) - (★+|No rating)$/;
  const match = title.match(titleRegex);

  if (match) {
    const [, filmTitle, year, stars] = match;
    return { filmTitle, year, stars };
  }

  // Fallback in case of unexpected format
  return { filmTitle: "Unknown", year: "Unknown", stars: "No rating" };
}

module.exports = { fetchLetterboxdRSS };
