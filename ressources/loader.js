import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Loads the main SVG source dynamically.
 * If in production mode, it loads the source from the pre-built `source.js` file.
 * If in development mode, it loads the source from the `assets/main.svg` file.
 * @returns {string} the SVG source
 */
async function loadSource() {
    // if dev load svg dynamically
    if (process.env.NODE_ENV.trim() === 'production') {
        console.log('prod mode');
        const { source } = await import('./source.js');
        return source;
    } else {
        console.log('dev mode');
        const fs = await import('fs');
        const path = await import('path');


        const filePath = path.join(__dirname, '..', 'assets', 'main.svg');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return fileContent;
    }
}

export { loadSource };
