const axios = require('axios');
const sharp = require('sharp');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');
const { findColor } = require('./color-utils');

/**
 * Generate an SVG representation of the film data.
 * @param {Object} data - The data object containing film details
 * @param {string} data.filmTitle - Title of the film
 * @param {string} data.year - Year of release
 * @param {string} data.stars - User's star rating (e.g., "★★★★")
 * @param {string} data.link - Link to the review on Letterboxd
 * @param {string} data.watchedDate - Date the film was watched
 * @param {string} data.rewatch - "Yes" or "No" indicating if this was a rewatch
 * @param {string} data.memberRating - User's numerical rating for the film (e.g., "4.0")
 * @param {string} data.tmdbId - The TMDb ID of the film
 * @param {string} data.description - Full HTML description of the review
 * @param {(string|null)} data.filmCover - URL to the film cover image, or null if not available
 * @param {string} data.creator - Name of the review creator (usually the username)
 * @param {string} backgroundTheme - The theme for background color matching.
 * @param {string} sourceSvg - The SVG template to edit (imported separately).
 * @returns {Promise<string>} - Rendered SVG as a string.
 */
async function generateSvg(data, backgroundTheme, sourceSvg) {

  const templateSvg = sourceSvg;
  const parser = new DOMParser();
  const svg = parser.parseFromString(templateSvg, 'image/svg+xml');

  // Update SVG elements
  updateElement(svg, 'title', data.filmTitle);
  updateElement(svg, 'stars', data.stars);
  updateElement(svg, 'date', data.year);
  updateElement(svg, 'ago', getTimeDiff(data.watchedDate));

  try {
    // Get and process image
    const imageResponse = await axios.get(data.filmCover, { responseType: 'arraybuffer' });
    const image = await sharp(imageResponse.data)
      .resize(70, 105)
      .jpeg({ quality: 80 })
      .toBuffer();
      const base64Image = `data:image/jpeg;base64,${image.toString('base64')}`;

      if (backgroundTheme == "colorMatch") {
        const {background, accent} = await findColor(base64Image);
        updateElement(svg, 'background', background, 'fill');
        updateElement(svg, 'stars', accent, 'fill');
      }
    // set cover info
    updateElement(svg, 'film_cover_small', base64Image, 'xlink:href');
    updateElement(svg, 'redirect', data.link, 'href');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    return new XMLSerializer().serializeToString(svg);
  }
}

function updateElement(svg, id, value, attribute = null) {
  const element = svg.getElementById(id);
  if (!element) return;

  if (attribute) {
    element.setAttribute(attribute, value);
  } else {
    const tspan = element.getElementsByTagName('tspan')[0];
    if (tspan) tspan.textContent = value;
  }
}

/**
 * Calculate human-readable time difference from a date string to now
 * @param {string} datetime - Date string in YYYY-MM-DD format
 * @returns {string} Human readable time difference (e.g. "2 days ago")
 */
function getTimeDiff(datetime) {
  // Convert YYYY-MM-DD to Date object
  const [year, month, day] = datetime.split('-').map(num => parseInt(num, 10));
  const date = new Date(year, month - 1, day); // month is 0-indexed in JS

  // Get difference in milliseconds
  const diffMs = Date.now() - date.getTime();

  // Handle invalid dates
  if (isNaN(diffMs)) {
    return 'none';
  }

  // Convert to seconds
  const diffSeconds = Math.floor(diffMs / 1000);

  // Time units in seconds
  const intervals = [
    { seconds: 31536000, label: 'y' },
    { seconds: 2592000, label: 'm' },
    { seconds: 86400, label: 'd' },
    { seconds: 3600, label: 'h' },
    { seconds: 60, label: 'min' },
    { seconds: 1, label: 's' }
  ];

  // Find the largest unit that fits
  for (const interval of intervals) {
    const value = Math.floor(diffSeconds / interval.seconds);
    if (value >= 1) {
      return `${value} ${interval.label}`;
    }
  }

  return 'now';
}
module.exports = { generateSvg };