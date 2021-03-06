const express = require('express')
const shortid = require('shortid')

const User = require('../models/User')
const Room = require('../models/Room')
const Attend = require('../models/Attend')
const Message = require('../models/Message')
const constants = require("../const/const")

const router = express.Router()

router.get('/retrieve', (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ msg: "You are not authorized to access this resource" });
  }
  const id = req.user._id
  try {
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
          return res.status(200).json({ msg: result })
        })
      })
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
})

router.get('/:id', (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ msg: "You are not authorized to access this resource" });
  }
  const id = req.params.id
  try {
    Room.findOne({ _id: id })
      .then((room) => {
        return res.status(200).json({ msg: room })
      })
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
})


router.post('/create', (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ msg: "You are not authorized to access this resource" });
  }

  const userId = req.user._id
  const { name, description, isPrivate } = req.body
  if (name.length == 0 || description.length == 0) {
    return res.status(400).json({ msg: "Please fill all the fields" })
  }
  try {
    const newRoom = new Room({
      shortId: shortid.generate(),
      name: name,
      description: description,
      creator: userId,
      isPrivate: isPrivate,
      color: Math.floor(Math.random() * 16777215).toString(16),
      lastMessageDate: new Date(),
      lastMessage: '',
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
          return res.status(200).json({ msg: newRoom })
        })
      })
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
})

router.put('/:id', (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ msg: "You are not authorized to access this resource" });
  }
  const id = req.params.id
  const { name, description, isPrivate, avatar } = req.body


  var room = {}
  if (name) room.name = name
  if (description) room.description = description
  if (avatar) room.avatar = avatar
  room.isPrivate = isPrivate

  try {
    Room.findOne({ _id: id }).then(result => {
      if (result) {
        if (result.isPrivate && !result.creator.equals(user._id)) {
          return res.status(403).json({ msg : "Please contact the room creator to update the room" })
        }
        Room.findOneAndUpdate({ _id: id }, room, { new: true }).then((room) => {
          return res.status(200).json({ msg: "Update successfully" });
        })
      }
    })
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }

})

router.post('/:id/attend', (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ msg: "You are not authorized to access this resource" });
  }
  try {
    Room.findOne({ shortId: req.params.id })
      .then((room) => {
        if (room.isPrivate === true) {
          return res.status(403).json({ msg: 'This room is private' })
        }
        Attend.findOne({ roomId: room._id, userId: req.user._id }).then(
          (attend) => {
            if (attend)
              return res.status(200).json({ msg: room })
            const newAttend = new Attend({
              userId: user._id,
              roomId: room._id,
            })
            newAttend.save().then((result) => {
              return res.status(200).json({ msg: room })
            })
          }
        )
      })
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
})

router.post('/:id/addMember', (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ msg: "You are not authorized to access this resource" });
  }
  const adminId = user._id.toString();
  try {
    Room.findOne({ _id: req.params.id })
      .then((room) => {
        req.body.emails.split(',').forEach((email) => {
          User.findOne({ email: email }).then((u) => {
            if (!u.active) {
              return res.status(403).json({ msg: `User with mail ${email} is not active` })
            }
            if (room.isPrivate && !room.creator.equals(user._id)) {
              return res.status(403).json({msg: "Please contact the room creator to add member"})
            }
            else {
              Attend.findOne({ roomId: room._id, userId: u._id }).then(
                (attend) => {
                  if (attend)
                    return res.status(400).json({ msg: `User with mail ${email} already in room` })
                  else {
                    const newAttend = new Attend({
                      userId: u._id,
                      roomId: room._id,
                    })
                    newAttend.save().then((result) => {
                      return res.status(200).json({ msg: 'Add successfully' })
                    })
                  }
                }
              )
            }
          }).catch((error) => {
            return res.status(404).json({ msg: `User with mail ${email} not found` });
          })
        })
      })
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
})

router.post('/:id/leave', (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ msg: "You are not authorized to access this resource" });
  }
  const userId = req.user._id
  const roomId = req.params.id
  try {
    Attend.deleteOne({ roomId: roomId, userId: userId }).then(() => {
      return res.status(200).json({ msg: 'success' })
    })
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
})

router.get('/:id/members', (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ msg: "You are not authorized to access this resource" });
  }

  const roomId = req.params.id

  try {
    Attend.find({ roomId: roomId }).then((rooms) => {
      const promises = []
      rooms.forEach((room) => {
        const subPromise = new Promise((resolve, reject) => {
          User.findOne({ _id: room.userId }).then((result) => resolve(result))
        })
        promises.push(subPromise)
      })
      Promise.all(promises).then((result) => {
        return res.status(200).json({ msg: result })
      })
    })
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
})

router.get('/:id/messages/:mess', (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ msg: "You are not authorized to access this resource" });
  }

  const roomId = req.params.id
  var query = req.params.mess
  query = query.toLowerCase()
  const result = []

  try {
    Message.find({ in: roomId }).then((messages) => {
      messages.forEach((message) => {
        if (message.content.includes(query) || message.from.username.includes(query)) {
          result.push({
            messageId: message._id,
            content: message.content,
            username: message.from.username,
            createdAt: message.createdAt,
            urls: message.from.urls,
            avatar: message.from.avatar,
            color: message.from.color,
          })
        }
      })
      return res.status(200).json({ msg: result })
    })
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
})

module.exports = router
