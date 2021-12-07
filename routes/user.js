const router = require("express").Router()
const User = require("../models/User")

router.get('/find', (req, res) => {
    User.findOne({ _id: req.cookies.userId }).then((user) => {
        res.status(200).json({ msg: user });
    }).catch((error) => {
        res.status(500).json({ msg: error });
    })
})

module.exports = router
