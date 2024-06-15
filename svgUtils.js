const cheerio = require('cheerio');
const axios = require('axios');
const Mustache = require('mustache');
const { findColor } = require('./colorUtils')

const {original, originalBackground, originalBackgroundSupport, colorBackgroundSupport} = require('./build/source.js');
const {noCover} = require('./build/source_no_cover.js');


async function generateSvg(newTitle, newDate, newStars, newFilmCoverURL, newRedirectUrl, datetime, backgroundTheme) {
    let svgContent;
    if (newFilmCoverURL){
        svgContent = await generateUpdatedSvg(newTitle, newDate, newStars, newFilmCoverURL, newRedirectUrl, datetime , backgroundTheme);
    }else{
        svgContent = await generateUpdatedSvgNoCover(newTitle, newDate, newStars, newRedirectUrl, datetime);
    }
    return svgContent;
}

async function generateUpdatedSvg(title, newDate, newStars, newFilmCoverURL, newRedirectUrl, datetime, backgroundTheme ) {
  
  const data = {
      starsColor: 'white', 
      titleColor: 'white', 
      dateColor: 'white', 
      agoColor: 'white', 
      title,
      date: newDate,
      stars: newStars,
      ago: timeSince(datetime), 
      filmCover: null ,
      newRedirectUrl: newRedirectUrl,
      background: originalBackground,
      backgroundSupport: originalBackgroundSupport,
  };

  

  try {
      const response = await axios.get(newFilmCoverURL, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(response.data, 'binary');
      const base64Image = imageData.toString('base64');
      data.filmCover = `data:image/jpeg;base64,${base64Image}`;

      if (backgroundTheme == "colorMatch") {
        const {background, accent} = await findColor(base64Image);
    
        data.starsColor = accent;
        data.titleColor = accent;
        data.dateColor = accent;
        data.agoColor = accent;
    
        data.backgroundHex = background

        data.backgroundSupport = Mustache.render(colorBackgroundSupport, data);
    
      }


  } catch (error) {
      console.error('Error fetching movie cover:', error);
      return generateUpdatedSvgNoCover(title, newDate, newStars, newRedirectUrl, environment);
  }


  return Mustache.render(original, data);
}

async function generateUpdatedSvgNoCover(newTitle, newDate, newStars, newRedirectUrl, datetime) {
    const svgContent = cheerio.load(noCover, { xmlMode: true });

    const data = {
      starsColor: 'white', 
      titleColor: 'white', 
      dateColor: 'white', 
      agoColor: 'white', 
      title: newTitle,
      date: newDate,
      stars: newStars,
      ago: timeSince(datetime),
      newRedirectUrl: newRedirectUrl,
      background: originalBackground,
      backgroundSupport: originalBackgroundSupport
  };

    return Mustache.render(svgContent.xml(), data);
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
