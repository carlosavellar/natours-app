const nodemailer = require('nodemailer');

exports.sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      password: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'José Carlos',
    to: 'carlos.avellar@gmail.com',
    subject: options.subject,
    text: options.message,
  };

  await transporter(mailOptions);
};
