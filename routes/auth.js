const router = require("express").Router()
const User = require("../models/User")
const mailService = require("../services/mailService")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")



router.post("/register", async (req, res) => {
  try {
    const { email, username, password, fullname } = req.body

    var user = await User.findOne({
      username: username,
    })

    user &&
      res.status(400).json({
        msg: "Username already exists",
      })

    user = await User.findOne({
      email: email,
    })

    if (user) {
      user.active &&
        res.status(400).json({
          msg: "User already exists",
        })

      let code = Math.floor(1000 + Math.random() * 9999)

      let mailOptions = {
        from: "son.pd184189@gmail.com",
        to: req.body.email,
        subject: "CHAT WEB NOTIFICATION",
        text: "Your code is: " + code,
      }

      mailService.sendMail(mailOptions)

      let salt = await bcrypt.genSalt(10)
      let hashedPassword = await bcrypt.hash(password, salt)

      user.fullname = fullname
      user.password = hashedPassword
      user.username = username
      user.code = code
      user.save()
    } else {
      let code = Math.floor(1000 + Math.random() * 9999)

      let mailOptions = {
        from: "son.pd184189@gmail.com",
        to: req.body.email,
        subject: "CHAT WEB NOTIFICATION",
        text: "Your code is: " + code,
      }

      mailService.sendMail(mailOptions)

      const newUser = new User({
        username: username,
        fullname: fullname,
        email: email,
        password: password,
        code: code,
      })

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newUser.password, salt)
      newUser.password = hashedPassword
      try {
        newUser.save()
      } catch (error) {
        console.log(error.message)
      }
    }
    res.status(200).json({
      msg: "User created",
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({
      msg: "Server error",
    })
  }
})

router.post("/verify", async (req, res) => {
  try {
    const { email, code } = req.body
    var user = await User.findOne({
      email: email,
    })

    if (user) {
      user.active && res.status(400).json({ msg: "Email has been verified" })
      user.code !== code &&
        res.status(400).json({ msg: "Code is not correct" })
      user.active = true
      user.save()
      res.status(200).json({
        msg: "Email verified",
      })
    } else {
      res.status(404).json({
        msg: "Email not found",
      })
    }
  } catch (err) {
    console.error(err.message)
    res.status(500).json({
      msg: "Server error",
    })
  }
})

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    })

    !user &&
      res.status(404).json({
        msg: "user not found",
      })

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    )

    !validPassword &&
      res.status(400).json({
        msg: "wrong password",
      })

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" })

    res.status(200).json({
      token: token,
    })

  } catch (err) {
    console.error(err.message)
    res.status(500).json({
      msg: "Server error",
    })
  }
})

module.exports = router
