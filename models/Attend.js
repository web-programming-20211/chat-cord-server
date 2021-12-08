const mongoose = require('mongoose')

const AttendSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
    }
})

module.exports = mongoose.model('Attend', AttendSchema, 'attend')