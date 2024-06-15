// test.js
const { createCanvas, loadImage } = require('canvas'); // For creating canvas in Node.js
const sharp = require('sharp'); // For image processing

// Function to calculate contrast ratio
function getContrastRatio(color1, color2) {
    const lum1 = getRelativeLuminance(color1);
    const lum2 = getRelativeLuminance(color2);
    const brighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (brighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(color) {
    const [r, g, b] = color;
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;
    const rL = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gL = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bL = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
}

// Function to fetch image from URL and process it
async function fetchAndProcessImage(url) {
    try {
        const fetch = await import('node-fetch').then(module => module.default);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch image');
        }
        const buffer = await response.buffer();
        
        // Process image with sharp
        const { data, info } = await sharp(buffer)
            .resize(300) // Resize image to reduce processing time
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { width, height, channels } = info;
        const pixels = width * height;

        let background = [255, 255, 255]; // Default to white
        let accent = [0, 0, 0]; // Default to black

        // Find suitable colors with sufficient contrast
        for (let i = 0; i < pixels * channels; i += channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const currentColor = [r, g, b];

            // Example: Check if the color is dark enough for background
            if (getRelativeLuminance(currentColor) < 0.5) {
                background = currentColor;
            }

            // Example: Check if the color is light enough for accent
            if (getRelativeLuminance(currentColor) > 0.5) {
                accent = currentColor;
            }

            // Additional checks and conditions can be added based on your specific requirements
        }

        return { background, accent };
    } catch (error) {
        console.error('Error fetching or processing image:', error);
        throw error;
    }
}

// Example usage
const imageUrl = 'https://a.ltrbxd.com/resized/film-poster/8/5/3/0/1/1/853011-love-lies-bleeding-0-1000-0-1500-crop.jpg?v=06376e593e';
fetchAndProcessImage(imageUrl)
    .then(({ background, accent }) => {
        console.log('Background color:', background);
        console.log('Accent color:', accent);
    })
    .catch(err => {
        console.error('Error:', err);
    });
