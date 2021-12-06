const mongoose = require('mongoose')

const AttendSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    }
})

module.exports = mongoose.model('Attend', AttendSchema, 'attend')