const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    content: String,
    in: mongoose.Schema.Types.ObjectId,
    from: {
        username: String,
        userId: mongoose.Schema.Types.ObjectId,
        color: String
    }
})

const Message = mongoose.model('Message', messageSchema, 'message')

module.exports = Message