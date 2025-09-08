const puppeteer = require('puppeteer');

async function htmlToPdfBuffer(html){
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  try{
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const buffer = await page.pdf({ format: 'A4', printBackground: true, margin:{ top:'12mm', right:'10mm', bottom:'12mm', left:'10mm' } });
    return buffer;
  }finally{
    await browser.close();
  }
}

module.exports = { htmlToPdfBuffer };


