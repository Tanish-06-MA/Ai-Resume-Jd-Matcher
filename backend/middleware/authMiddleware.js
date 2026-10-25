const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

    const authorization = req.header("Authorization");
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : authorization;

    if (!token) {
        return res.status(401).json({
            message: "Access Denied. No Token Provided."
        });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid Token"
        });

    }

};

module.exports = authMiddleware;
