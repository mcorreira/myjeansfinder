const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key';

exports.verifyToken = (req, res, next) => {
  try {
    // get token from request headers
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(403).json({ message: 'No token provided' });
    }

    // verify token

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ message: 'Unauthorized', error: err.message });
      }

      // Add user to request object

      req.userID = decoded.id;

      // Continue to the next middleware or rcontroller
      next();
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
