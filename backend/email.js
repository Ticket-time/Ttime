const nodemailer = require('nodemailer');

const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "answjdals77@gmail.com",
        pass: "gukpswpfpzrojlwv"
    },
    tls: {
        rejectUnauthorized: false
    }
  });


module.exports = smtpTransport
  