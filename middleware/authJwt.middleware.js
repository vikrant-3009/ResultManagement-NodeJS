const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verifyJwt = (role) => {
    return (req, res, next) => {
        const token = req.cookies?.jwt;

        if (!token) {
            return res.status(401).send('Access Denied');
        }
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            (err, decoded) => {
                if (err) {
                    return res.status(401).send('Invalid Token');
                }
                else if (decoded.role !== role) {
                    return res.status(403).send('Unathorized');
                }
                req.id = decoded.id;
                next();
            }
        );
    };
}