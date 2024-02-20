const axios = require('axios'); // Import Axios module

const fs = require('fs');
const cheerio = require('cheerio');
const svgContent = require('./build/source.js');

const environment = process.env.NODE_ENV || 'development';

const svgFilePath = './source.svg';

async function generateUpdatedSvg(newTitle, newDate, newStars, newFilmCoverURL) {

    let $;
    if (environment === 'development') {
        console.log("Dev env");
        const svgFile = fs.readFileSync(svgFilePath, 'utf-8');
        $ = cheerio.load(svgFile, { xmlMode: true });
    } else {
        $ = cheerio.load(svgContent.initialSvgContent, { xmlMode: true });
    }

    if (!$) {
        return "Sorry, an error occurred";
    }

    $('#title tspan').text(newTitle);
    $('#date tspan').text(newDate);
    $('#starts tspan').text(newStars);

    try {
        const response = await axios.get(newFilmCoverURL, { responseType: 'arraybuffer' });
        const imageData = Buffer.from(response.data, 'binary');
        const base64Image = imageData.toString('base64');
        $('#film_cover_small').attr('xlink:href', `data:image/jpeg;base64,${base64Image}`);
    } catch (error) {
        console.error('Error fetching or encoding the film cover:', error);
        $('#film_cover_small').attr('xlink:href', newFilmCoverURL);
        // You can handle the error as per your requirement
    }

    return $.xml();
}

module.exports = { generateUpdatedSvg };
