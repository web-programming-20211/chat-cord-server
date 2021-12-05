var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function sendMail(mailOptions) {
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) return error;
  });
}

module.exports = {sendMail};
