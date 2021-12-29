const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    shortId: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    isPrivate: {
        type: Boolean,
        required: true,
        default: false,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    avatar: {
        type: String,
        default: "",
    },
    color: {
        type: String,
        required: true,
        default: '#000000'
    },
    pinnedMessages: [
    ],
    lastMessage: {
        type: String,
    },
    lastMessageDate: {
        type: Date,
    },
})

module.exports = mongoose.model('Room', RoomSchema, 'room')
