import { extractDominantColorsRgba } from '../services/okmain.service.js';

function componentToHex(channel) {
  const hex = channel.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function rgbToHex([r, g, b]) {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

function srgbToLinear(value) {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance([r, g, b]) {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(first, second) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function bytesToRgbTriplets(bytes) {
  const colors = [];
  for (let index = 0; index + 2 < bytes.length; index += 3) {
    colors.push([bytes[index], bytes[index + 1], bytes[index + 2]]);
  }
  return colors;
}

function pickBestBlackOrWhite(primary) {
  const white = [255, 255, 255];
  const black = [0, 0, 0];
  return contrastRatio(primary, white) >= contrastRatio(primary, black) ? white : black;
}

function pickContrastingBackground(primary, palette, minContrast) {
  for (let index = 1; index < palette.length; index++) {
    if (contrastRatio(primary, palette[index]) >= minContrast) {
      return palette[index];
    }
  }

  return pickBestBlackOrWhite(primary);
}

async function findColor({ width, height, rgba, minContrast = 4.5 }) {
  try {
    const dominantBytes = await extractDominantColorsRgba(width, height, rgba);
    const palette = bytesToRgbTriplets(dominantBytes);

    if (!palette.length) {
      throw new Error('No palette extracted from okmain WASM.');
    }

    const primary = palette[0];
    const background = pickContrastingBackground(primary, palette, minContrast);

    return {
      background: rgbToHex(background),
      accent: rgbToHex(primary)
    };
  } catch (error) {
    console.error('Error processing image with okmain WASM:', error);
    return {
      background: '#000000',
      accent: '#ffffff'
    };
  }
}

export { findColor };
