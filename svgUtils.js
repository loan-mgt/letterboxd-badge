const axios = require('axios'); // Import Axios module

const fs = require('fs');
const cheerio = require('cheerio');
const svgContent = require('./build/source.js');
const svgContentNoCover = require('./build/source_no_cover.js');

const environment = process.env.NODE_ENV || 'development';

const svgFilePath = './source.svg';

async function generateSvg(newTitle, newDate, newStars, newFilmCoverURL, newRedirectUrl, datetime) {
    let svgContent;
    if (newFilmCoverURL){
        svgContent = await generateUpdatedSvg(newTitle, newDate, newStars, newFilmCoverURL, newRedirectUrl,datetime);
    }else{
        svgContent = await generateUpdatedSvgNoCover(newTitle, newDate, newStars, newRedirectUrl, datetime);
    }
    return svgContent;
}

async function generateUpdatedSvg(newTitle, newDate, newStars, newFilmCoverURL, newRedirectUrl, datetime) {
    
    let $;
    if (environment === 'development') {
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
    $('#stars tspan').text(newStars);
    $('#ago tspan').text(timeSince(datetime));
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

async function generateUpdatedSvgNoCover(newTitle, newDate, newStars, newRedirectUrl, datetime) {
    const $ = cheerio.load(svgContentNoCover.initialSvgContent, { xmlMode: true });

    $('#title tspan').text(newTitle);
    $('#date tspan').text(newDate);
    $('#starts tspan').text(newStars);
    $('#ago tspan').text(timeSince(datetime));
    $('#redirect').attr('href', newRedirectUrl);

    return $.xml();
}


function timeSince(date_string) {
    var date = new Date(date_string);

    var seconds = Math.floor((new Date() - date) / 1000);
  
    var interval = seconds / 31536000;
    if (!date_string){
        return "";
    }
  
    if (interval > 1) {
      return Math.floor(interval) + " y";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " mo";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + "d";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + "h";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + "mi";
    }
    return Math.floor(seconds) + "s";
  }


module.exports = { generateSvg };
