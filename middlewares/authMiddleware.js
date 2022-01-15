const jwt = require('jsonwebtoken')
const User = require('../models/User')
const config = require('../config/config')

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

        const decoded = jwt.verify(token, config.jwtSecret);
        if (decoded) {
            let user = await User.findById(decoded.id);
            if (user) {
                req.user = user;
            }
            
            if(decoded.exp < Date.now() / 1000) {
                return res
                    .status(401)
                    .send({ msg: 'Your token has expired' });
            }
        }
        next();
    } catch (err) {
        return res.status(401).send({ msg: 'You are not authorized to access this resource' });
    }
};

module.exports = auth