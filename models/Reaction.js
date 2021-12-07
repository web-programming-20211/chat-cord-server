const mongoose = require('mongoose')

const reactionSchema = new mongoose.Schema({
    reaction_type: Number,
    reaction_name: String
})

const Reaction = mongoose.model('Reaction', reactionSchema, 'reaction')

module.exports = Reaction