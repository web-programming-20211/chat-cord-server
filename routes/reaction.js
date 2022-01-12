const express = require('express')

const { React, getReactionsByMessage } = require('../models/React')

const router = express.Router()

router.post('/retrieve', (request, response) => {
    const user = req.user;
    if (!user) {
        return res.status(404).json({ msg: "You are not authorized to access this resource" });
    }
    React.find({ react_at: request.body.id }).then(result => {
        const reactions = getReactionsByMessage(result)
        response.send(reactions)
    })
})

module.exports = router