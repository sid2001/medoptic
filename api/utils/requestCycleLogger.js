const fs = require("fs");
class RCLogger {
  constructor(logfile) {
    this.logfile = logfile;
    this.logdata = {};
    this.globalStartTime = Date.now();
    try{
      this.fd = fs.openSync(this.logfile, "a");
    } catch(err) {
      console.error("Could not open log file: ",err);
    }
  }

  static updateG
  logRequestCycle(req,res,next) {
    const start = Date.now();
    next();
    const delta = Date.now() - start;
    this.logdata[req.ip+"$"+req.url] = [...this.logdata[req.ip+"$"+req.url]||[],{delta,"content-length":req.headers["content-length"]||"-1"}];
    
    if(this.globalStartTime - Date.now() > 7200) {
      try{
        fs.writeSync(this.fd,JSON.stringify(this.logdata));
        this.logdata = {};
      }catch (err) {
        console.error("Could not write to log file: ",err);
      }      
    }
    console.log(`${req.method} ${req.url} ${delta}ms`);
  }
}