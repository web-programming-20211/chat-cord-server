const express = require('express')

const Message = require('../models/Message')

const router = express.Router()

//get message from one room
router.get('/room/:id', (request, response) => {
  //get message which in room has _id = request.body._id
  const id = request.params.id
  Message.find({ in: id }).then(result => {
    response.send(result)
  })
})

module.exports = router