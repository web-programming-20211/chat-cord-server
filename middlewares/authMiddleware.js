const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!req.headers.authorization) {
            next();
            return res
                .status(401)
                .send({ msg: 'You are not authorized to access this resource' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded) {
            let user = await User.findById(decoded.id);
            if (user) {
                req.user = user;
            }
        }
        next();
    } catch (err) {
        return res.status(401).send({ msg: 'You are not authorized to access this resource' });
    }
};

module.exports = auth