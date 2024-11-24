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
      // Remove data URL prefix if present
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
  
      // Load image with Jimp
      const image = await Jimp.read(buffer);
      
      // Resize for faster processing
      image.resize(300, Jimp.AUTO);
  
      const width = image.bitmap.width;
      const height = image.bitmap.height;
      
      let colors = [];
      let pixelCount = 0;
  
      // Sample pixels and collect colors
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const { r, g, b } = Jimp.intToRGBA(image.getPixelColor(x, y));
          colors.push([r, g, b]);
          pixelCount++;
        }
      }
  
      // Sort colors by luminance
      colors.sort((a, b) => getRelativeLuminance(a) - getRelativeLuminance(b));
  
      // Select background color from darker colors
      const background = colors[Math.floor(colors.length * 0.2)];
      // Select accent color from lighter colors
      const accent = colors[Math.floor(colors.length * 0.8)];
  
      return {
        background: rgbToHex(background),
        accent: rgbToHex(accent)
      };
    } catch (error) {
      console.error('Error processing image:', error);
      return {
        background: '#000000',
        accent: '#ffffff'
      };
    }
  }
  

// Exported main function
async function findColor(base64Image) {

    return await processBase64Image(base64Image);

}

module.exports = { findColor };
