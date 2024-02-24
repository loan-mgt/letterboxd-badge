const axios = require('axios'); // Import Axios module

const fs = require('fs');
const cheerio = require('cheerio');
const svgContent = require('./build/source.js');
const svgContentNoCover = require('./build/source_no_cover.js');

const environment = process.env.NODE_ENV || 'development';

const svgFilePath = './source.svg';

async function generateSvg(newTitle, newDate, newStars, newFilmCoverURL, newRedirectUrl) {
    let svgContent;
    if (newFilmCoverURL){
        svgContent = await generateUpdatedSvg(newTitle, newDate, newStars, newFilmCoverURL, newRedirectUrl);
    }else{
        svgContent = await generateUpdatedSvgNoCover(newTitle, newDate, newStars, newRedirectUrl);
    }
    return svgContent;
}

async function generateUpdatedSvg(newTitle, newDate, newStars, newFilmCoverURL, newRedirectUrl) {
    
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
    $('#redirect').attr('href', newRedirectUrl);

    try {
        const response = await axios.get(newFilmCoverURL, { responseType: 'arraybuffer' });
        const imageData = Buffer.from(response.data, 'binary');
        const base64Image = imageData.toString('base64');
        $('#film_cover_small').attr('xlink:href', `data:image/jpeg;base64,${base64Image}`);
    } catch (error) {
        console.error('Error fetching movie cover:', error);
        return generateUpdatedSvgNoCover(newTitle, newDate, newStars, newRedirectUrl);
    }

    return $.xml();
}

async function generateUpdatedSvgNoCover(newTitle, newDate, newStars, newRedirectUrl) {
    const $ = cheerio.load(svgContentNoCover.initialSvgContent, { xmlMode: true });

    $('#title tspan').text(newTitle);
    $('#date tspan').text(newDate);
    $('#starts tspan').text(newStars);
    $('#redirect').attr('href', newRedirectUrl);

    return $.xml();
}

module.exports = { generateSvg };
