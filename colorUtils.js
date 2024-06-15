const Jimp = require('jimp'); // For image processing


function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgb) {
    const [r, g, b] = rgb;
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
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

// Function to process base64 image data
async function processBase64Image(base64Image) {
    try {
        // Convert base64 to buffer
        const buffer = Buffer.from(base64Image, 'base64');

        // Load the image with Jimp
        const image = await Jimp.read(buffer);

        // Resize the image to reduce processing time
        image.resize(300, Jimp.AUTO);

        const width = image.bitmap.width;
        const height = image.bitmap.height;

        const pixels = width * height;

        let background = [255, 255, 255]; // Default to white
        let accent = [0, 0, 0]; // Default to black

        // Find suitable colors with sufficient contrast

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const { r, g, b } = Jimp.intToRGBA(image.getPixelColor(x, y));
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

        }

        return {
            background: rgbToHex(background),
            accent: rgbToHex(accent)
        };
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
}

// Exported main function
async function findColor(base64Image) {

    return await processBase64Image(base64Image);

}

module.exports = { findColor };
