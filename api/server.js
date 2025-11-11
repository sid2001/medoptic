const express = require('express');
const cors = require('cors');
const ocr = require('./routes/ocr');
const testRoutes = require('./routes/test');
const mtagRoutes = require('./routes/mtag');
const userRoutes = require('./routes/user');
const templateRoutes = require('./routes/template');
const adminRoutes = require('./routes/admin');
const mongoose = require("mongoose");
const cron = require('node-cron');
const { generateAndPersistWeeklyReports, renderWeeklyHtmlReport } = require('./services/reports');
const TemporaryReport = require('./models/temporaryReport');
const { sendReportEmail } = require('./services/email');
const { htmlToPdfBuffer } = require('./services/pdf');
require('dotenv').config();


const app = express();
app.use((req,res,next)=>{
  const start = Date.now();
  console.log("enter");
  res.on('finish', () => {
    const delta = Date.now() - start;
    console.log("exit");
    console.log(`${req.method} ${req.originalUrl} ${delta}ms`);
  });
  next();
  //const delta = Date.now() - start;
  //console.log("exit");
  //console.log(`${req.method} ${req.url} ${delta}ms`);
})

app.use(cors({
  //origin:[process.env.ALLOW_ORIGIN],
  credentials:true
}));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
// app.use('/test', testRoutes);
app.use('/mtag', mtagRoutes);
app.use('/user', userRoutes);
app.use('/template', templateRoutes);
app.use('/admin', adminRoutes);
app.use('/file', ocr);
app.use('/', (req,res)=>{
  res.send('hello');
});

mongoose.connect(process.env.MONGO_URI,{dbName:'medoptic'})
.then(()=>{
  app.listen({port: process.env.PORT || 8080,host:process.env.HOST || '127.0.0.1'},()=>{
    console.log(`server started on http://${process.env.HOST || '127.0.0.1'}:${process.env.PORT || 8080}`);  
  }) 
  // Schedule: Every Saturday at 23:59 server local time
  cron.schedule('59 23 * * 6', async () => {
    try{
      console.log('[CRON] Generating weekly reports...');
      const { weekStart, weekEnd, created } = await generateAndPersistWeeklyReports();
      console.log(`[CRON] Weekly reports generated: ${created.length}`);

      // Send emails sequentially
      for(const item of created){
        try{
          const doc = await TemporaryReport.findOne({ _id: item.id });
          if(!doc){
            console.warn(`[CRON] Temp report not found for ${item.email}`);
            continue;
          }
          // Decode blob into object for HTML rendering
          let payload;
          try{ payload = JSON.parse(Buffer.from(doc.data).toString('utf-8')); }catch(_){ payload = null; }
          const html = payload ? renderWeeklyHtmlReport(item.email, new Date(payload.weekStart), new Date(payload.weekEnd), payload.scans || []) : undefined;
          const pdfBuffer = html ? await htmlToPdfBuffer(html) : null;
          await sendReportEmail(item.email, 'Weekly Medication Report', `Weekly report for ${weekStart.toISOString()} - ${weekEnd.toISOString()}`, pdfBuffer ? {
            filename: `report_${weekStart.toISOString().slice(0,10)}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          } : undefined, html);
          console.log(`[CRON] Sent report to ${item.email}`);
          // Optionally delete immediately (commented out to rely on TTL)
          if(process.env.DELETE_TEMP_REPORTS === 'true'){
            await TemporaryReport.deleteOne({ _id: item.id });
          }
        }catch(e){
          console.error(`[CRON] Failed to send report to ${item.email}`, e);
        }
      }
    }catch(err){
      console.error('[CRON] Weekly report generation failed', err);
    }
  });
})
//export default async function handler(req, res) {
//	await mongoose.connect(process.env.MONGO_URI,{dbName:'medoptic'});
//	return app(req, res);
//}
