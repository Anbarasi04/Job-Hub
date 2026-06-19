// Error handling middleware
module.exports = (err, req, res, next) => {
  console.error(err.stack || err);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Server Error',
  });
};

