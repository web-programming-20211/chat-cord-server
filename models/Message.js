const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    content: String,
    urls: [String],
    in: mongoose.Schema.Types.ObjectId,
    from: {
        username: String,
        userId: mongoose.Schema.Types.ObjectId,
        color: String,
        avatar: String
    },
    pinned : {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
})

const Message = mongoose.model('Message', messageSchema, 'message')

module.exports = Message