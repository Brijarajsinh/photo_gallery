const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const transporter = nodemailer.createTransport(smtpTransport({

  //creates a smtp connection
  
  service:'gmail',
  host: "localhost",
  port: 587,
  secure: true, // upgrade later with STARTTLS
  logger: true,
  debug: true,
  secureConnection: false,
  auth: {
    user: "mahidabrijrajsinh2910@gmail.com",
    pass: "vhixfftgjmyjwrid",
  },
}));

transporter.verify(function (error, success) {
  if (error) {
    console.log("Error Generated While Sending E-mail");
    console.log(error);
  } else {
    console.log("................Server is ready to take our messages..........");
  }
});

module.exports = transporter;