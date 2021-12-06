const express = require('express')
const path = require('path')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const authMiddleware = require('./middlewares/authMiddleware')
const authRouter = require('./routes/auth')
const roomRouter = require('./routes/room')
const cookieParser = require('cookie-parser')
require('dotenv').config()


try {
    mongoose.connect(
        process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
    )
} catch (e) {
    console.log('failed')
}

const db = mongoose.connection
db.on('error', console.error.bind(console, 'error:'))
db.once('open', () => {})

app.use(express())
app.use(express.static(path.join(__dirname + '/client/build')))
const port = process.env.PORT || 8080

app.use(cors({
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200,
}))

app.use(express.urlencoded({
    extended: true
}))

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRouter)
app.use('/api/room',authMiddleware, roomRouter)

app.get('*', (request, response) => {
    response.sendFile(path.join(__dirname + '/client/build/index.html'))
})

app.listen(port, () => console.log(`Running on port ${port}`))