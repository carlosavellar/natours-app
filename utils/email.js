const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //  create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      type: 'PlAIN',
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //   create the email
  const mailOptions = {
    type: 'plain',
    from: 'Jos� Carlos <carlos.avellar@gmail.com>',

    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //   send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
