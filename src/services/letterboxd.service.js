import axios from 'axios';
import { parseString } from 'xml2js';
import { load } from 'cheerio';
import { promisify } from 'util';

// Convert parseString to Promise-based function
const parseXMLString = promisify(parseString);

const LETTERBOXD_RSS_URL = "https://letterboxd.com";

/**
 * Fetch and parse the RSS feed for a given username.
 * @param {string} username - Letterboxd username
 */
async function fetchLetterboxdRSS(username) {
  const rssUrl = `${LETTERBOXD_RSS_URL}/${username}/rss/`;

  try {
    // Fetch RSS feed with proper headers and timeout
    const response = await axios.get(rssUrl, {
      headers: { 
        'Accept': 'application/rss+xml, application/xml, text/xml',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000
    });

    // Parse XML to JSON
    const parsedData = await parseXMLString(response.data, {
      trim: true,
      explicitArray: false,
      mergeAttrs: true
    });

    // Verify the RSS structure
    if (!parsedData?.rss?.channel?.item) {
      console.error('Invalid RSS feed structure:', parsedData);
      return [];
    }

    // Normalize items to always be an array
    const items = Array.isArray(parsedData.rss.channel.item) 
      ? parsedData.rss.channel.item 
      : [parsedData.rss.channel.item];

    // Map the reviews into a more convenient format
    return items.map(review => parseReviewItem(review)).filter(Boolean);

  } catch (error) {
    console.error('Error fetching RSS feed:', {
      username,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return [];
  }
}

/**
 * Parse a single review item from the RSS feed
 * @param {Object} review - Raw review item from RSS feed
 */
function parseReviewItem(review) {
  try {
    const { filmTitle, year, stars } = parseTitle(review.title || '');

    return {
      filmTitle,
      year,
      stars,
      link: review.link || '',
      watchedDate: review["letterboxd:watchedDate"] || '',
      rewatch: review["letterboxd:rewatch"] || 'No',
      memberRating: review["letterboxd:memberRating"] || '',
      tmdbId: review["tmdb:movieId"] || '',
      description: review.description || '',
      filmCover: extractFilmCover(review.description),
      creator: review["dc:creator"] || ''
    };
  } catch (error) {
    console.error('Error parsing review item:', error);
    return null;
  }
}

/**
 * Extract the film cover image URL from the description field
 * @param {string} description - HTML content
 */
function extractFilmCover(description) {
  if (!description) return null;

  try {
    const $ = load(description);
    const imgSrc = $('img').first().attr('src');
    return imgSrc || null;
  } catch (error) {
    console.error('Error extracting film cover:', error);
    return null;
  }
}

/**
 * Parse the title to extract film details
 * @param {string} title - Raw title string
 */
function parseTitle(title) {
  const defaultResult = { filmTitle: "Unknown", year: "Unknown", stars: "No rating" };
  
  if (!title) return defaultResult;

  try {
    const titleRegex = /^(.*), (\d{4})(?: - ((★|½)+|No rating))?$/;
    const match = title.match(titleRegex);

    if (match) {
      const [, filmTitle, year, stars = 'No rating'] = match;
      return { filmTitle, year, stars };
    }

    return defaultResult;
  } catch (error) {
    console.error('Error parsing title:', error);
    return defaultResult;
  }
}

// Test function to verify the feed
async function testFeed(username) {
  try {
    const reviews = await fetchLetterboxdRSS(username);
    console.log('Parsed reviews:', JSON.stringify(reviews, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

export { fetchLetterboxdRSS, testFeed };