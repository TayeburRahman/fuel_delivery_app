const nodemailer = require('nodemailer');
const config = require('../config/index');

async function sendAdminMail(to, subject, html) {
  const transporter = nodemailer.createTransport({
    host: config.smtp.smtp_host,
    port: parseInt(config.smtp.smtp_port),
    // secure: false,
    auth: {
      user: config.smtp.smtp_mail,
      pass: config.smtp.smtp_password,
    },
  });

  await transporter.sendMail({
    from: config.smtp.smtp_mail,
    to,
    subject: subject,
    html,
  });
}

module.exports = { sendAdminMail };
