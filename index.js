const express = require('express')
const path = require('path')
const app = express()
const socket = require('socket.io')
const cors = require('cors')
const Message = require('./models/Message')
const User = require('./models/User')
const { React, getReactionsByMessage } = require('./models/React')
const mongoose = require('mongoose')
const authMiddleware = require('./middlewares/authMiddleware')
const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')
const roomRouter = require('./routes/room')
const messageRouter = require('./routes/message')
const reactionRouter = require('./routes/reaction')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const firebaseService = require('./services/firebaseService')
require('dotenv').config()


try {
    mongoose.connect(
        "mongodb://127.0.0.1:27017/chat", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    )
} catch (e) {
    console.log('failed')
}
// try {
//     mongoose.connect(
//         process.env.MONGO_URL, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     },
//     )
// } catch (e) {
//     console.log('failed')
// }

const db = mongoose.connection
db.on('error', console.error.bind(console, 'error:'))
db.once('open', () => { })

app.use(express())
app.use(express.static(path.join(__dirname + '/client/build')))
const port = process.env.PORT || 8080

app.use(cors({
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200,
}))

app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
  });

app.use(express.urlencoded({
    extended: true
}))

app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRouter)
app.use('/user', userRouter)
app.use('/room', roomRouter)
app.use('/message', messageRouter)
app.use('/reaction', reactionRouter)


const upload = multer({
    storage: multer.memoryStorage()
})
app.post('/testUpload', upload.single('file'), (req, res) => {

    try {
        firebaseService.uploadFile(req.file)
    } catch (error) {
        console.log(error)
        return  res.status(404).send(error)
    }
    res.status(200).send("File uploaded.")
        
})

// app.get('*', (request, response) => {
//     response.sendFile(path.join(__dirname + '/client/build/index.html'))
// })

const server = app.listen(port, () => console.log(`Running on port ${port}`))


const io = socket(server)

io.on('connection', (socket) => {
    socket.emit('connected')
    socket.on('joinRoom', (currentRoom) => {
        if (currentRoom?._id !== -1) {
            socket.join(currentRoom?._id)
        }
    })

    socket.on('leaveRoom', (currentRoom) => {
        socket.leave(currentRoom?._id)
    })

    //message sending event has been fired from a socket
    socket.on('chat', (message, cookie, currentRoom) => {
        const index = cookie.indexOf('"')
        const new_cookie = cookie.slice(index + 1, cookie.length - 1)

        User.findOne({ _id: new_cookie }).then(result => {
            if (result) {
                //get userinfo
                User.findOne({ _id: new_cookie }).then(user => {
                    //create a message model
                    const message_instance = {
                        content: message,
                        in: mongoose.Types.ObjectId(currentRoom),
                        from: {
                            userId: result._id,
                            fullname: result.fullname,
                            color: result.color
                        }
                    }
                    const message_model = new Message(message_instance)
                    message_model.save((err, result) => {
                        io.in(currentRoom).emit('your_new_message', result)
                    })
                })
            }
        })
    })

    //delete a message
    socket.on('delete', (id, room) => {
        Message.deleteOne({ _id: id }).then(result => {
            socket.to(room._id).emit('dialog-deleted', id)
        })
    })

    //reaction event has been fired
    socket.on('get-reaction', (dialog, reactionType, cookie, roomId) => {

        //get userinfo
        User.findOne({ _id: cookie }).then(user => {
            React.findOne({
                react_at: dialog._id, from: {
                    userId: mongoose.Types.ObjectId(cookie),
                    username: user.username
                }
            }).then(react_info => {
                if (react_info) {
                    if (react_info.react_id == reactionType) {
                        React.deleteOne({ react_at: dialog._id, from: { userId: user._id, username: user.username }, react_id: reactionType }).then((r) => {
                            React.find({ react_at: dialog._id }).then(result => {
                                const edited_list = getReactionsByMessage(result)
                                edited_list._id = dialog._id
                                socket.to(roomId).emit('return-reaction', edited_list)
                            })
                        })
                    } else {
                        react_info.react_id = reactionType
                        react_info.save(err => {
                            if (err)
                                handleError(err)
                            React.find({ react_at: dialog._id }).then(result => {
                                const edited_list = getReactionsByMessage(result)
                                socket.to(roomId).emit('return-reaction', edited_list)
                            })
                        })
                    }
                } else {
                    const new_react = new React({
                        react_id: reactionType,
                        react_at: mongoose.Types.ObjectId(dialog._id),
                        from: {
                            userId: mongoose.Types.ObjectId(cookie),
                            username: user.username
                        }
                    })

                    new_react.save(err => {
                        if (err) handleError(err)
                        React.find({ react_at: dialog._id }).then(result => {
                            const edited_list = getReactionsByMessage(result)
                            socket.to(roomId).emit('return-reaction', edited_list)
                        })
                    })
                }
            })
        })
    })

    socket.on('disconnect', () => { })
})
