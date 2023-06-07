const nodemailer = require('nodemailer');
require("dotenv").config();
const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PWD
    },
    tls: {
        rejectUnauthorized: false
    }
  });


module.exports = smtpTransport
  