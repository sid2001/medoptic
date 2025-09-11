const nodemailer = require('nodemailer');


function getTransporter(){
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GOOGLE_USER,
          pass: process.env.GOOGLE_PASS,
        }
      });
      return transporter;
}


async function sendReportEmail(to, subject, text, attachment, html){
  // if(!credentials) await authorize();
  const t = getTransporter();
  const mail = {
    from: process.env.MAIL_FROM || 'no-reply@medoptic.local',
    to,
    subject: subject || 'Weekly Medication Report',
    text: text || 'Please find the attached weekly report.',
    html,
    attachments: attachment ? [attachment] : []
  };

  try{
    let res = await t.sendMail(mail);
    return res;
  }catch(e){
    console.error("Mail failed.");
    throw e;
  }
}

module.exports = { sendReportEmail };


