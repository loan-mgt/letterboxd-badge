import { generateSvg } from '../services/svg.service.js';
import { fetchLetterboxdRSS } from '../services/letterboxd.service.js';
import { loadSource } from '../../ressources/loader.js';
import config from '../config.js';

const letterboxdRoutes = (app) => {
  app.get('/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const theme = req.query.theme ?? config.defaultTheme;
      const index = Number(req.query.index ?? 0);

      const reviews = await fetchLetterboxdRSS(username);

      if (!reviews?.length) {
        return res.status(404).send('No activity found.');
      }

      const selectedReview = reviews[index];
      console.log('Selected review:', selectedReview);

      const svg = await generateSvg(selectedReview, theme, await loadSource());

      res.contentType('image/svg+xml');
      res.send(svg);

      console.log('SVG sent successfully.');
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).send('Internal server error.');
    }
  });
};

export { letterboxdRoutes };
