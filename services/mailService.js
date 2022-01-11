var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "yandex",
  secure: false,
  auth: {
    user: "phngdung@yandex.com",
    pass: "abcD123$",
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

module.exports = {sendMail};
