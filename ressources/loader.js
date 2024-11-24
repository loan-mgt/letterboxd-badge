async function loadSource() {

    // if dev load svg dynamically
    if (process.env.NODE_ENV === 'production') {
        const { source } = require('./ressources/source.js');
        return source;
    } else {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, 'assets', 'main.svg');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return fileContent;
    }

}

module.exports = { loadSource };