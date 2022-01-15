const router = require("express").Router()
const User = require("../models/User")
const Message = require("../models/Message")
const bcrypt = require("bcrypt")

router.get('/find', (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(404).json({ msg: "You are not authorized to access this resource" });
    }
    User.findOne({ _id: user._id }).then((user) => {
        res.status(200).json({ msg: user });
    }).catch((error) => {
        res.status(500).json({ msg: error });
    })
})

router.put('/:id', async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(404).json({ msg: "You are not authorized to access this resource" });
    }
    const userId = user._id;
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
        Message.find({'from.userId': user._id}).then((messages) => {
            if(messages) {
                messages.forEach(message => {
                    message.from.avatar = user.avatar
                    message.save()
                })
            }
        })
        return res.status(200).json({ msg: "Update successfully" });
    }
    ).catch((error) => {
        return res.status(500).json({ msg: error });
    })
})

module.exports = router
