import config from './config.js';
const setupMiddleware = (app) => {
    app.use((req, res, next) => {
        res.setHeader('Cache-Control', `s-max-age=${config.cache.maxAge}, stale-while-revalidate`);
        next();
    });
};

export { setupMiddleware };

