const express = require('express')
const shortid = require('shortid')

const User = require('../models/User')
const Room = require('../models/Room')
const Attend = require('../models/Attend')
const mongoose = require('mongoose')

const router = express.Router()

//get full list of rooms that user has attended
router.get('/retrieve', (req, res) => {
  const id = req.cookies.userId
  Attend.find({ userId: id })
    .then((rooms) => {
      const promises = []
      rooms.forEach((room) => {
        const subPromise = new Promise((resolve, reject) => {
          Room.findOne({ _id: room.roomId }).then((result) => resolve(result))
        })
        promises.push(subPromise)
      })
      Promise.all(promises).then((result) => {
        res.status(200).json({ msg: result })
      })
    })
    .catch((err) => {
      res.status(500).json({ msg: err.message })
    })
})

// get room by id 
router.get('/:id', (req, res) => {
  const id = req.params.id
  Room.findOne({ _id: id })
    .then((room) => {
      res.status(200).json({ msg: room })
    })
    .catch((err) => {
      res.status(404).json({ msg: 'Room not found' })
    })
})


//create a room
router.post('/create', (req, res) => {
  const userId = req.cookies.userId
  const { name, description, isPrivate } = req.body

  const newRoom = new Room({
    shortId: shortid.generate(),
    name: name,
    description: description,
    creator: userId,
    isPrivate: isPrivate,
    color: Math.floor(Math.random() * 16777215).toString(16),
  })

  newRoom
    .save()
    .then((result) => {
      const newAttend = new Attend({
        roomId: result._id,
        userId: userId,
      })
      newAttend.save().then((result) => {
        res.status(200).json({ msg: newRoom })
      })
    })
    .catch((err) => {
      res.status(500).json({ msg: err.message })
    })
})

//attend a public room
router.post('/:id/attend', (req, res) => {
  Room.findOne({ shortId: req.params.id })
    .then((room) => {
      if(room.isPrivate === true){
        return res.status(404).json({ msg: 'this room is private' })}
      Attend.findOne({ roomId: room._id, userId: req.cookies.userId }).then(
        (attend) => {
          if (attend)
            return res.status(400).json({ msg: room })
          const newAttend = new Attend({
            userId: req.cookies.userId,
            roomId: room._id,
          })
          newAttend.save().then((result) => {
            return res.status(200).json({ msg: room })
          })
        }
      )
    })
    .catch(() => {
      return res.status(404).json({ msg: 'room not found' })
    })
})

//add user to a private room by gmail
router.post('/:id/add/:mail', (req, res) => {
  var userId;
  var adminId= req.cookies.userId;

  User.findOne({ mail: req.params.mail }).then((user) => {
    userId= user._id.toString()
    console.log(userId)
  }).catch((error) => {
    res.status(404).json({ msg: "user with this mail not found" });
  })

  Room.findOne({ shortId: req.params.id })
    .then((room) => {
      if(adminId !== room.creator.toString()){
        return res.status(404).json({ msg: 'Only admin can add member' })}
      else {
      Attend.findOne({ roomId: room._id, userId: req.params.userId }).then(
        (attend) => {
          if (attend)
            return res.status(400).json({ msg: room })
          const newAttend = new Attend({
            userId: req.params.userId,
            roomId: room._id,
          })
          newAttend.save().then((result) => {
            return res.status(200).json({ msg: room })
          })
        }
      )
      }
    })
    .catch(() => {
      return res.status(404).json({ msg: 'room not found' })
    })
})

//leave the room
router.post('/:id/leave', (req, res) => {
  const userId = req.cookies.userId
  const roomId = req.params.id
  Attend.deleteOne({ roomId: roomId, userId: userId }).then(() => {
    res.status(200).json({ msg: 'success' })
  }).catch(() => {
    res.status(404).json({ msg: 'room not found' })
  })

})

// get members of a room
router.get('/:id/members', (req, res) => {
  const roomId = req.params.id
  Attend.find({ roomId: roomId }).then((rooms) => {
    const promises = []
    rooms.forEach((room) => {
      const subPromise = new Promise((resolve, reject) => {
        User.findOne({ _id: room.userId }).then((result) => resolve(result))
      })
      promises.push(subPromise)
    })
    Promise.all(promises).then((result) => {
      res.status(200).json({ msg: result })
    })
  }).catch(() => {
    res.status(404).json({ msg: 'room not found' })
  })
})

module.exports = router
