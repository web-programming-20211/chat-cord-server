const router = require("express").Router()
const User = require("../models/User")
const bcrypt = require("bcrypt")

router.get('/find', (req, res) => {
    User.findOne({ _id: req.cookies.userId }).then((user) => {
        res.status(200).json({ msg: user });
    }).catch((error) => {
        res.status(500).json({ msg: error });
    })
})

router.put('/:id', async (req, res) => {
    const userId = req.params.id
    const { fullname, username, password, avatar } = req.body
    var userInfo = {}
    if (fullname) userInfo.fullname = fullname
    if (username) userInfo.username = username
    if (password) {
        let salt = await bcrypt.genSalt(10)
        let hashedPassword = await bcrypt.hash(password, salt)
        userInfo.password = hashedPassword
    }
    if (avatar) userInfo.avatar = avatar

    User.findOneAndUpdate({ _id: userId }, userInfo, { new: true }).then((user) => {
        res.status(200).json({ msg: "Update successfully" });
    }
    ).catch((error) => {
        res.status(500).json({ msg: error });
    })
})

module.exports = router
