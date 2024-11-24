import { letterboxdRoutes } from './letterboxd.routes.js';

const setupRoutes = (app) => {
  app.get('/', (req, res) => {
    res.send('Hello! Please use /:username');
  });

  // Register Letterboxd routes
  letterboxdRoutes(app);
};

export {setupRoutes};
