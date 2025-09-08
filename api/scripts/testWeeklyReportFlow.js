/*
  Test script to:
  1) Seed a few RFID mtags
  2) Send scan events via API (to exercise duplicate/wrong-day detection)
  3) Generate weekly reports and email them immediately

  Usage:
    MONGO_URI=mongodb://... node scripts/testWeeklyReportFlow.js
    (Optionally) API_BASE=http://127.0.0.1:8080 SMTP_* envs; if SMTP_* not set, uses Ethereal
*/

require('dotenv').config();
const axios = require('axios').default;
const mongoose = require('mongoose');

const Mtag = require('../models/mtag');
const TemporaryReport = require('../models/temporaryReport');
const { generateAndPersistWeeklyReports } = require('../services/reports');
const { sendReportEmail } = require('../services/email');

function pickDayMaskForWrongDay(){
  // Set dayMask so today is 0 (wrong day). Mon..Sun order
  const now = new Date();
  const jsDay = now.getDay(); // 0..6 Sun..Sat
  const idx = jsDay === 0 ? 6 : jsDay - 1; // 0..6 Mon..Sun
  const arr = ['1','1','1','1','1','1','1'];
  arr[idx] = '0';
  return arr.join('');
}

async function seedMtags(){
  const items = [
    { rfidKeyHash: 'rfid_demo_1', email: 'sidharth2001.lumia@gmail.com', dayMask: '1111100' }, // Mon-Fri
    { rfidKeyHash: 'rfid_demo_2', email: 'vasu.somani2022@vitstudent.ac.in', dayMask: pickDayMaskForWrongDay() },
  ];
  for(const it of items){
    await Mtag.updateOne(
      { rfidKeyHash: it.rfidKeyHash },
      {
        _id: it.rfidKeyHash,
        rfidKeyHash: it.rfidKeyHash,
        userId: 'test-user',
        storeName: 'Test Store',
        doctorName: 'Dr. Who',
        medicineName: 'Panacea',
        medicineDose: '500mg',
        medicineFrequency: '1111',
        medicineQuantity: {
          morning: { beforeMeal: true, count: 1 },
          afternoon: { beforeMeal: false, count: 1 },
          evening: { beforeMeal: false, count: 1 }
        },
        expiryDate: new Date(Date.now() + 30*24*60*60*1000),
        notes: 'Test note',
        email: it.email,
        dayMask: it.dayMask
      },
      { upsert: true }
    );
  }
  console.log('[TEST] Seeded mtags');
}

async function postScan(apiBase, rfidKeyHash, frequencyMask, dayMask){
  await axios.post(`${apiBase}/user/rfid/scan`, { rfidKeyHash, frequencyMask, dayMask }).then(()=>{
    console.log(`[TEST] Scan posted: ${rfidKeyHash} ${frequencyMask}`)
  });
}

async function seedScans(apiBase){
  // For rfid_demo_1: valid morning scan, then duplicate morning scan
  await postScan(apiBase, 'rfid_demo_1', '1000', '1111100');
  await postScan(apiBase, 'rfid_demo_1', '1000', '1111100');

  // For rfid_demo_2: any slot today will be wrong-day due to dayMask crafted above
  await postScan(apiBase, 'rfid_demo_2', '0100', pickDayMaskForWrongDay());
}

async function generateAndEmail(){
  console.log('[TEST] Generating and emailing reports');
  const { weekStart, weekEnd, created } = await generateAndPersistWeeklyReports();
  console.log(`[TEST] Reports created for ${created.length} recipients`);
  for(const item of created){
    const doc = await TemporaryReport.findOne({ _id: item.id });
    if(!doc){
      console.warn(`[TEST] No temp report found for ${item.email}`);
      continue;
    }
    // Decode for HTML
    let payload; try{ payload = JSON.parse(Buffer.from(doc.data).toString('utf-8')); }catch(_){ payload = null; }
    const { renderWeeklyHtmlReport } = require('../services/reports');
    const { htmlToPdfBuffer } = require('../services/pdf');
    const html = payload ? renderWeeklyHtmlReport(item.email, new Date(payload.weekStart), new Date(payload.weekEnd), payload.scans||[]) : undefined;
    const pdfBuffer = html ? await htmlToPdfBuffer(html) : null;
    await sendReportEmail(item.email, 'Weekly Medication Report (TEST)', `Weekly report for ${weekStart.toISOString()} - ${weekEnd.toISOString()}`, pdfBuffer ? {
      filename: `report_${weekStart.toISOString().slice(0,10)}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    } : undefined, html);
  }
}

async function main(){
  const apiBase = process.env.API_BASE || 'http://127.0.0.1:3000';
  if(!process.env.MONGO_URI){
    throw new Error('MONGO_URI not set');
  }
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'medoptic' });
  try{
    await seedMtags();
    await seedScans(apiBase);
    await generateAndEmail();
    console.log('[TEST] Done. Check your inbox or Ethereal preview URLs above.');
  }finally{
    await mongoose.disconnect();
  }
}

main().catch(err=>{
  console.error(err);
  process.exit(1);
});


