const express = require('express')

const { React, getReactionsByMessage } = require('../models/React')

const router = express.Router()

router.post('/retrieve', (request, response) => {
    React.find({ react_at: request.body.id }).then(result => {
        const reactions = getReactionsByMessage(result)
        response.send(reactions)
    })
})

module.exports = router