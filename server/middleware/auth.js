const jwt = require('jsonwebtoken');

const verifyToken = (requiredRole = null) => (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // If a role is required, check if the user has the correct role
        if (requiredRole && decoded.role !== requiredRole) {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this resource' });
        }

        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    next();
  };

module.exports = { verifyToken, verifyAdmin };
