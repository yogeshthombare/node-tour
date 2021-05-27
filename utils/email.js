const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  // define email options
  const emailOptions = {
    from: 'Yogesh T <thombareyd@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.emailBody
    // html
  };
  // send email
  await transporter.sendEmail(emailOptions);
}

module.exports = sendEmail;