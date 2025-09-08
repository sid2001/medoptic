const nodemailer = require('nodemailer');

let transporter;

function getTransporter(){
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.GOOGLE_USER,
          pass: process.env.GOOGLE_PASS,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
          accessToken: process.env.GOOGLE_ACCESS_TOKEN,
        }
      });
      return transporter;
}

async function sendReportEmail(to, subject, text, attachment, html){
  const t = getTransporter();
  const mail = {
    from: process.env.MAIL_FROM || 'no-reply@medoptic.local',
    to,
    subject: subject || 'Weekly Medication Report',
    text: text || 'Please find the attached weekly report.',
    html,
    attachments: attachment ? [attachment] : []
  };
  return t.sendMail(mail);
}

module.exports = { sendReportEmail };


