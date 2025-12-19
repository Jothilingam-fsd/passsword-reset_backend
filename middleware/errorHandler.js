export default function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Email already exists',
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
}
