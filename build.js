const fs = require('fs');
const path = require('path');

// Define the path to the build directory
const buildDir = path.join(__dirname, 'build');

// Check if the build directory exists, if not, create it
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
}

// Read the content of source.svg
const svgContent = fs.readFileSync('source.svg', 'utf8');

// Generate the content for source.js
const sourceJSContent = `const initialSvgContent = \`${svgContent}\`;

module.exports = { initialSvgContent };
`;

// Write the content to source.js in the build directory
fs.writeFileSync(path.join(buildDir, 'source.js'), sourceJSContent, 'utf8');

console.log('Build step completed: source.svg content saved to source.js');
