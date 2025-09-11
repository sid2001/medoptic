const nodemailer = require('nodemailer');
const proc = require('process');
const path = require('path');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const {fs} = require('fs');

let transporter;
let CREDENTIALS_PATH = path.join(proc.cwd(), `${process.env.GOOGLE_CREDENTIALS_PATH}`);
let TOKEN_PATH = path.join(proc.cwd(), `${process.env.TOKEN_PATH}`);

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
let credentials = null

function getTransporter(){
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          // type: 'OAuth2',
          user: process.env.GOOGLE_USER,
          pass: process.env.GOOGLE_PASS,
          // clientId: credentials.client_id,
          // clientSecret: credentials.client_secret,
          // refreshToken: credentials.refresh_token,
          // accessToken: credentials,
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
    // console.log(res);
    return res;
  }catch(e){
    // if token expired, refresh it
    console.error("Mail failed.");
    throw e;
  }
}

module.exports = { sendReportEmail };


