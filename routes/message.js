const express = require('express')
const mongoose = require('mongoose');

const Message = require('../models/Message')

const router = express.Router()

router.get('/room/:id', (request, response) => {
  const user = req.user;
  if (!user) {
      return res.status(404).json({ msg: "You are not authorized to access this resource" });
  }
  
  const id = request.params.id
  if (mongoose.Types.ObjectId.isValid(id)) {
    Message.find({ in: id }).then(result => {
      response.json({msg:result})
    })
  }
})

module.exports = router