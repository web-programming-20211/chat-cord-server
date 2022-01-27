const express = require('express')
const mongoose = require('mongoose');
const Message = require('../models/Message')
const router = express.Router()

router.get('/room/:id', (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ msg: "You are not authorized to access this resource" });
  }
  const id = req.params.id
  if (mongoose.Types.ObjectId.isValid(id)) {
    Message.find({ in: id }).then(result => {
      return res.status(200).json({ msg: result })
    })
  }
})

module.exports = router