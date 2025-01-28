import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
    const { token } = req.headers;
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
            return res.status(403).json({ message: 'Token has expired.' });
        }
        req.id = decoded.id;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
}
