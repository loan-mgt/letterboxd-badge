const fs = require('fs');
const cheerio = require('cheerio');
const svgContent = require('./build/source.js');

const environment = process.env.NODE_ENV || 'development';

const svgFilePath = './source.svg';

function generateUpdatedSvg(newTitle, newDate, newStars, newFilmCoverURL) {

    let $;
    if (environment == 'development') {
        console.log("Dev env")
        const svgFile = fs.readFileSync(svgFilePath, 'utf-8');
        $ = cheerio.load(svgFile, { xmlMode: true });
    }else{
        $ = cheerio.load(svgContent.initialSvgContent, { xmlMode: true });
    }

    if (!$){
        return "Sorry en Error occured"
    }

    $('#title tspan').text(newTitle);
    $('#date tspan').text(newDate);
    $('#starts tspan').text(newStars);
    $('#film_cover_small').attr('xlink:href', newFilmCoverURL);

    return $.xml();
}

module.exports = { generateUpdatedSvg };