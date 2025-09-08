const Scan = require('../models/scan');
const Mtag = require('../models/mtag');
const TemporaryReport = require('../models/temporaryReport');

function getDefaultWeekRange(referenceDate){
  const now = referenceDate ? new Date(referenceDate) : new Date();
  const d = new Date(now);
  const day = d.getDay(); 
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0,0,0,0);
  const weekStart = d;
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return { weekStart, weekEnd };
}

async function aggregateWeeklyReports(weekStart, weekEnd){
  const pipeline = [
    { $match: { scannedAt: { $gte: weekStart, $lt: weekEnd } } },
    { $lookup: { from: 'mtags', localField: 'rfidKeyHash', foreignField: 'rfidKeyHash', as: 'mtag' } },
    { $unwind: '$mtag' },
    { $group: {
      _id: '$mtag.email',
      scans: { $push: { rfidKeyHash: '$rfidKeyHash', frequencyMask: '$frequencyMask', dayMask: '$dayMask', scannedAt: '$scannedAt', isDuplicate: '$isDuplicate', isWrongDay: '$isWrongDay', slot: '$slot' } }
    } }
  ];
  const results = await Scan.aggregate(pipeline);
  return results;
}

async function generateAndPersistWeeklyReports(referenceDate){
  const { weekStart, weekEnd } = getDefaultWeekRange(referenceDate);
  const aggregates = await aggregateWeeklyReports(weekStart, weekEnd);

  // Create temporary binary blobs and store with TTL
  const ttlDays = parseInt(process.env.REPORT_TTL_DAYS || '14', 10);
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  const created = [];
  for(const group of aggregates){
    const payload = { email: group._id, weekStart, weekEnd, scans: group.scans };
    const json = JSON.stringify(payload);
    const buffer = Buffer.from(json, 'utf-8');
    const tempReport = new TemporaryReport({ email: group._id, weekStart, weekEnd, data: buffer, expiresAt });
    await tempReport.save();
    created.push({ email: group._id, id: tempReport._id });
  }
  return { weekStart, weekEnd, reports: aggregates, created };
}

module.exports = {
  getDefaultWeekRange,
  aggregateWeeklyReports,
  generateAndPersistWeeklyReports
}


function formatDateYYYYMMDD(d){
  const y = d.getFullYear();
  const m = `${d.getMonth()+1}`.padStart(2,'0');
  const dd = `${d.getDate()}`.padStart(2,'0');
  return `${y}-${m}-${dd}`;
}

function getWeekDays(weekStart){
  return Array.from({length:7}).map((_,i)=>{
    const d = new Date(weekStart);
    d.setDate(d.getDate()+i);
    return d;
  });
}

function renderWeeklyHtmlReport(email, weekStart, weekEnd, scans){
  const days = getWeekDays(weekStart);
  // Build map date->slot arrays of scans
  const dayMap = {};
  for(const d of days){
    const key = formatDateYYYYMMDD(d);
    dayMap[key] = {
      morning: [],
      noon: [],
      evening: [],
      night: []
    };
  }
  const missed = [];
  for(const s of scans){
    const dt = new Date(s.scannedAt);
    const key = formatDateYYYYMMDD(dt);
    if(!dayMap[key]) continue;
    const slotKey = s.slot || 'morning';
    if(dayMap[key][slotKey]){
      dayMap[key][slotKey].push(s);
    }
  }


  for(const d of days){
    const key = formatDateYYYYMMDD(d);
    const entry = dayMap[key];
    for(const slot of ['morning','noon','evening','night']){
      const arr = entry[slot] || [];
      if(arr.length===0){
        missed.push({ date: key, slot });
      }
    }
  }

  const style = `
  <style>
    *{box-sizing:border-box}
    body{font-family:Arial,Helvetica,sans-serif;background:#f6f7fb;color:#222;margin:0;padding:0}
    .container{max-width:900px;width:100%;margin:0 auto;padding:16px;overflow-x:hidden}
    .card{background:#fff;border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,0.06);padding:16px}
    h1{font-size:22px;margin:0 0 8px}
    .sub{color:#666;margin:0 0 12px}
    .calendar{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));column-gap:8px;row-gap:8px;margin-top:12px;width:100%}
    .day{background:#fafbff;border:1px solid #e6e9f5;border-radius:10px;padding:8px;min-width:0}
    .date{font-weight:600;color:#2d3a6d;margin-bottom:6px;word-wrap:break-word}
    .slot{display:flex;align-items:center;justify-content:space-between;font-size:12px;margin:6px 0;padding:6px 8px;border-radius:8px;border:1px solid #e8ebf7}
    .ok{background:#e9f9ee;color:#1b7f3b;border-color:#c6efcf}
    .dup{background:#fff6e5;color:#a86200;border-color:#ffe1a6}
    .wrong{background:#ffecec;color:#a30000;border-color:#ffc9c9}
    .miss{background:#f1f3fb;color:#6b7280;border-color:#e5e7f5}
    .pill{padding:2px 8px;border-radius:999px;font-weight:600}
    .list{margin-top:16px}
    .miss-item{background:#fff;border:1px dashed #e6e9f5;border-radius:10px;padding:10px;margin:6px 0}
    .footer{color:#7a819b;font-size:12px;margin-top:16px;text-align:center}
    @media (max-width: 720px){.calendar{grid-template-columns:repeat(3,minmax(0,1fr))}}
    @media (max-width: 480px){.calendar{grid-template-columns:repeat(2,minmax(0,1fr))}}
  </style>`;

  function summarizeSlot(scansArr){
    const total = scansArr.length;
    const dup = scansArr.filter(s=>s.isDuplicate).length;
    const wrong = scansArr.filter(s=>s.isWrongDay).length;
    const valid = scansArr.filter(s=>!s.isWrongDay).length;
    const first = scansArr[0];
    return { total, dup, wrong, valid, first };
  }

  function renderSlot(slotName, scansArr){
    const { total, dup, wrong, valid, first } = summarizeSlot(scansArr||[]);
    if(total===0){
      return `<div class="slot miss"><span>${slotName}</span><span class="pill">Missed</span></div>`;
    }
    if(valid>0){
      const time = first ? new Date(first.scannedAt).toLocaleTimeString() : '';
      const meta = `(${total} scan${total>1?'s':''}${dup?`, ${dup} dup${dup>1?'s':''}`:''})`;
      return `<div class="slot ok"><span>${slotName}</span><span class="pill">Taken ${time} ${meta}</span></div>`;
    }
    if(wrong>0){
      const meta = `(${total} scan${total>1?'s':''})`;
      return `<div class="slot wrong"><span>${slotName}</span><span class="pill">Wrong day ${meta}</span></div>`;
    }
    const meta = `(${dup} dup${dup>1?'s':''})`;
    return `<div class="slot dup"><span>${slotName}</span><span class="pill">Duplicate ${meta}</span></div>`;
  }

  const dayCards = days.map(d=>{
    const key = formatDateYYYYMMDD(d);
    const entry = dayMap[key];
    const label = d.toLocaleDateString(undefined,{ weekday:'short', month:'short', day:'numeric'});
    return `<div class="day">
      <div class="date">${label}</div>
      ${renderSlot('Morning', entry.morning)}
      ${renderSlot('Noon', entry.noon)}
      ${renderSlot('Evening', entry.evening)}
      ${renderSlot('Night', entry.night)}
    </div>`;
  }).join('');

  const missedList = missed.map(m=>`<div class="miss-item">${m.date} — ${m.slot}</div>`).join('');

  const html = `<!doctype html><html><head><meta charset="utf-8">${style}</head><body>
    <div class="container">
      <div class="card">
        <h1>Weekly Medication Report</h1>
        <div class="sub">${email} · ${weekStart.toDateString()} — ${weekEnd.toDateString()}</div>
        <div class="calendar">${dayCards}</div>
        <div class="list">
          <h3 style="margin:12px 0 8px">Missed Slots</h3>
          ${missedList || '<div class="miss-item">None 🎉</div>'}
        </div>
        <div class="footer">Generated by MedOptic</div>
      </div>
    </div>
  </body></html>`;
  return html;
}

module.exports.renderWeeklyHtmlReport = renderWeeklyHtmlReport;


