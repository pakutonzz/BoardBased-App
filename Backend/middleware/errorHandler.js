// middleware/errorHandler.js
module.exports = (err, req, res, _next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Server error' });
};
