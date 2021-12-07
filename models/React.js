const mongoose = require('mongoose')

const reactSchema = new mongoose.Schema({
    react_id: Number,
    react_at: mongoose.Types.ObjectId,
    from: {
        userId: mongoose.Schema.Types.ObjectId,
        username: String
    },
})

const React = mongoose.model('React', reactSchema, 'react')

const getReactionsByMessage = (reacts) => {
    const result = []
    reacts.forEach(react => {
        const index = result.findIndex(react_instance => react_instance.reaction_type === react.react_id)

        if (index !== -1) {
            result[index].from.push(react.from)
        } else {
            result.push({
                reaction_type: react.react_id,
                from: [react.from]
            })
        }
    })

    return { _id: reacts[0]?.react_at, data: result }
}

module.exports = { React, getReactionsByMessage }