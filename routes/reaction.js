const express = require('express')
const { React, getReactionsByMessage } = require('../models/React')
const router = express.Router()

router.get('/retrieve', (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(404).json({ msg: "You are not authorized to access this resource" });
    }
    React.find({ react_at: req.body.id }).then(result => {
        if(result)
        {
            const reactions = getReactionsByMessage(result)
            res.send({ reactions })
        }
    })
})

module.exports = router