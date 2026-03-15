import axios from 'axios';
import sharp from 'sharp';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { findColor } from '../utils/color.utils.js';
import config from '../config.js';

const WHITE_RGB = [255, 255, 255];

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
  const formattedTitle = withManualEllipsis(data.filmTitle, 19);

  // Update SVG elements
  updateElement(svg, 'title', formattedTitle);
  updateElement(svg, 'stars', data.stars);
  updateElement(svg, 'date', data.year);
  updateElement(svg, 'ago', getTimeDiff(data.watchedDate));

  try {
    // Get and process image
    const imageResponse = await axios.get(data.filmCover, { responseType: 'arraybuffer' });
    const resizedImage = sharp(imageResponse.data).resize(70, 105);

    const [jpegImage, rawImage] = await Promise.all([
      resizedImage.clone().jpeg({ quality: 80 }).toBuffer(),
      resizedImage.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    ]);
    const base64Image = `data:image/jpeg;base64,${jpegImage.toString('base64')}`;

    if (backgroundTheme === 'colorMatch') {
      const { background, accent } = await findColor({
        width: rawImage.info.width,
        height: rawImage.info.height,
        rgba: rawImage.data,
        minContrast: config.color.minContrast
      });

      console.log('colorMatch extracted colors:', { background, accent });

      updateElement(svg, 'background', background, 'fill');
      updateElement(svg, 'title', accent, 'fill');
      updateElement(svg, 'date', accent, 'fill');
      updateElement(svg, 'ago', accent, 'fill');
      updateElement(svg, 'stars', accent, 'fill');

      const backgroundRgb = hexToRgb(background);
      if (backgroundRgb) {
        const contrastWithWhite = contrastRatio(backgroundRgb, WHITE_RGB);
        if (contrastWithWhite < 4.5) {
          applyInsideStroke(svg, 'background', accent, 2);
          console.log('colorMatch border enabled:', { contrastWithWhite, stroke: accent });
        }
      }
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

function withManualEllipsis(value, maxLength) {
  if (typeof value !== 'string') return '';
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(maxLength - 3, 0))}...`;
}

function hexToRgb(hexColor) {
  if (typeof hexColor !== 'string') return null;
  const sanitizedHex = hexColor.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(sanitizedHex)) return null;

  return [
    parseInt(sanitizedHex.slice(0, 2), 16),
    parseInt(sanitizedHex.slice(2, 4), 16),
    parseInt(sanitizedHex.slice(4, 6), 16)
  ];
}

function srgbToLinear(channel) {
  const normalized = channel / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance([r, g, b]) {
  const linearR = srgbToLinear(r);
  const linearG = srgbToLinear(g);
  const linearB = srgbToLinear(b);
  return 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
}

function contrastRatio(firstRgb, secondRgb) {
  const firstLuminance = relativeLuminance(firstRgb);
  const secondLuminance = relativeLuminance(secondRgb);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function applyInsideStroke(svg, id, color, width) {
  const element = svg.getElementById(id);
  if (!element) return;

  const clipPathId = `${id}-inside-stroke-clip`;
  let defs = svg.getElementsByTagName('defs')[0];

  if (!defs) {
    defs = svg.createElement('defs');
    const rootSvg = svg.getElementsByTagName('svg')[0];
    if (rootSvg) {
      rootSvg.insertBefore(defs, rootSvg.firstChild);
    } else {
      return;
    }
  }

  let clipPath = svg.getElementById(clipPathId);
  if (!clipPath) {
    clipPath = svg.createElement('clipPath');
    clipPath.setAttribute('id', clipPathId);
    defs.appendChild(clipPath);
  }

  while (clipPath.firstChild) {
    clipPath.removeChild(clipPath.firstChild);
  }

  const clipShape = element.cloneNode(true);
  clipShape.removeAttribute('id');
  clipShape.removeAttribute('stroke');
  clipShape.removeAttribute('stroke-width');
  clipShape.removeAttribute('clip-path');
  clipShape.removeAttribute('style');
  clipPath.appendChild(clipShape);

  element.setAttribute('stroke', color);
  element.setAttribute('stroke-width', String(width));
  element.setAttribute('clip-path', `url(#${clipPathId})`);
}

function updateElement(svg, id, value, attribute = null) {
  const element = svg.getElementById(id);
  if (!element) return;

  if (attribute) {
    element.setAttribute(attribute, value);
    if (attribute === 'fill') {
      element.setAttribute('style', `fill:${value};`);
      const tspans = element.getElementsByTagName('tspan');
      for (let index = 0; index < tspans.length; index++) {
        tspans[index].setAttribute('fill', value);
        tspans[index].setAttribute('style', `fill:${value};`);
      }
    }
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
export { generateSvg };