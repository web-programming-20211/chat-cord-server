var nodemailer = require("nodemailer");
var config = require('../config/config');


var transporter = nodemailer.createTransport({
  service: config.mailService,
  secure: false,
  auth: {
    user: config.mailUser,
    pass: config.mailPass,
  },
});

function sendMail(mailOptions) {
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          return error;
        }
        else {
          console.log('Email sent: ' + info.response);
        }
      });
      console.log("MAIL SERVER: Server is ready to take our messages");
    }
  });
}

module.exports = { sendMail };
