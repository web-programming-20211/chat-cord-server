const router = require("express").Router()
const User = require("../models/User")
const mailService = require("../services/mailService")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const constants = require("../const/const")
router.post("/register", async (req, res) => {
  try {
    const { email, username, password, fullname } = req.body

    var user = await User.findOne({
      username: username,
    })

    if (user) {
      return res.status(400).json({
        msg: "That username is taken. Try another.",
      })
    }

    user = await User.findOne({
      email: email,
    })

    if (user) {
      if (user.active) {
        return res.status(400).json({
          msg: "User with that email already exists",
        })
      }

      let code = Math.floor(1000 + Math.random() * 9999)

      let mailOptions = {
        from: process.env.MAIL_USER,
        to: req.body.email,
        subject: "CHAT WEB NOTIFICATION",
        text: "Your verify code is: " + code,
      }

      mailService.sendMail(mailOptions)

      let salt = await bcrypt.genSalt(10)
      let hashedPassword = await bcrypt.hash(password, salt)

      user.fullname = fullname
      user.password = hashedPassword
      user.username = username
      user.code = code
      user.avatar = constants.AVATAR
      user.color = Math.floor(Math.random() * 16777215).toString(16)
      user.save()
    } else {
      let code = Math.floor(1000 + Math.random() * 9999)

      let mailOptions = {
        from: process.env.MAIL_USER,
        to: req.body.email,
        subject: "CHAT WEB NOTIFICATION",
        text: "Your verify code is: " + code,
      }

      mailService.sendMail(mailOptions)

      const newUser = new User({
        username: username,
        fullname: fullname,
        email: email,
        password: password,
        code: code,
        avatar : constants.AVATAR,
        color: Math.floor(Math.random() * 16777215).toString(16),
      })

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newUser.password, salt)
      newUser.password = hashedPassword
      newUser.save()
    }
    res.status(200).json({
      msg: "Your account has been successfully created! We'll send a verify code to the email address you used to create the account.",
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
      if (user.active) {
        return res.status(400).json({
          msg: "User with that email is already active!",
        })
      } else if (user.code !== code)
        return res.status(400).json({ msg: "Verify code is incorrect" })
      else {
        user.active = true
        user.save()
        return res.status(200).json({
          msg: "Email successfully verified",
        })
      }
    } else {
      return res.status(404).json({
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
      active: true,
    })

    if (!user)
      return res.status(404).json({
        msg: "user not found",
      })

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    )

    if (!validPassword)
      return res.status(400).json({
        msg: "wrong password",
      })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" })
    
    return res.status(200).json({
      token: token,
    })

  } catch (err) {
    res.status(500).json({
      msg: "Server error",
    })
  }
})

module.exports = router
