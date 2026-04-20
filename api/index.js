const app = require("../backend/server.js");

module.exports = (req, res) => {
    // Vercel Serverless strips the "/api" prefix from req.url when routing to this function.
    // If we don't add it back, our Express app routes (e.g., app.use('/api/auth')) will 404!
    if (!req.url.startsWith('/api')) {
        req.url = '/api' + req.url;
    }
    
    // Pass the request back to the Express application
    return app(req, res);
};
