const express = require('express')
const shortid = require('shortid')

const User = require('../models/User')
const Room = require('../models/Room')
const Attend = require('../models/Attend')
const mongoose = require('mongoose')
const constants = require("../const/const")

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
    lastMessageDate: new Date(),
    pinnedMessages: [],
    avatar: constants.AVATAR,
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

//update a room
router.put('/:id', (req, res) => {
  const id = req.params.id
  const { name, description, isPrivate, avatar } = req.body
  var room = {}
  if (name) room.name = name
  if (description) room.description = description
  if (avatar) room.avatar = avatar
  room.isPrivate = isPrivate
  Room.findOneAndUpdate({ _id: id }, room, { new: true }).then((room) => {
    res.status(200).json({ msg: "Update successfully" });
  }
  ).catch((error) => {
    res.status(500).json({ msg: error });
  })
})

//attend a public room
router.post('/:id/attend', (req, res) => {
  Room.findOne({ shortId: req.params.id })
    .then((room) => {
      if (room.isPrivate === true) {
        return res.status(400).json({ msg: 'this room is private' })
      }
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

//only admin can add user to a private/public room by gmail
router.post('/:id/add', (req, res) => {
  var userId;
  const adminId = req.cookies.userId;
  Room.findOne({ _id: req.params.id })
    .then((room) => {
      req.body.emails.split(',').forEach((email) => {
        console.log(email)
        User.findOne({ email: email }).then((user) => {
          userId = user._id
          if (adminId !== room.creator.toString()) {
            return res.status(400).json({ msg: 'only admin can add member' })
          }
          else {
            Attend.findOne({ roomId: room._id, userId: userId }).then(
              (attend) => {
                if (attend)
                  return res.status(400).json({ msg: `user with mail ${email} already in room` })
                else {
                  console.log(userId, room._id)
                  const newAttend = new Attend({
                    userId: userId,
                    roomId: room._id,
                  })
                  newAttend.save().then((result) => {
                    return res.status(200).json({ msg: 'add successfully' })
                  })
                }
              }
            )
          }
        }).catch((error) => {
          return res.status(404).json({ msg: `user with mail ${email} not found` });
        })
      })
    }).catch(() => {
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
