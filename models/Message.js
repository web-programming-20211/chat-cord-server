const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    content: String,
    urls: [String],
    in: mongoose.Schema.Types.ObjectId,
    from: {
        fullname: String,
        userId: mongoose.Schema.Types.ObjectId,
        color: String
    }
}, {
    timestamps: true,
})

const Message = mongoose.model('Message', messageSchema, 'message')

module.exports = Message