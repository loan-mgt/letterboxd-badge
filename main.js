import express from 'express';
import { setupRoutes } from './src/routes/index.js';
import { setupMiddleware } from './src/middleware.js';
import config from './src/config.js';

const app = express();

// Setup middleware
setupMiddleware(app);

// Setup routes
setupRoutes(app);

// Start server
app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
