const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes and verify JWT tokens
 */
exports.protect = async (req, res, next) => {
    let token;

    // 1. Check if token is in headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // 2. Get token from header
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("[AUTH MIDDLEWARE] Decoded User:", decoded);

            // 4. Attach user id to request (dashboardController expects req.user.id)
            req.user = { id: decoded.id };

            next();
        } catch (error) {
            console.error('[AUTH MIDDLEWARE] Token verification failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};
