const express = require('express');
const cors = require('cors'); 
const testRoutes = require('./routes/test');
const mtagRoutes = require('./routes/mtag');
const userRoutes = require('./routes/user');
const templateRoutes = require('./routes/template');
const adminRoutes = require('./routes/admin');
const mongoose = require("mongoose");
require('dotenv').config();

const app = express();
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

mongoose.connect(process.env.MONGO_URI,{dbName:'medoptic'})
.then(()=>{
  app.listen({port: process.env.PORT || 8080,host:process.env.HOST || '127.0.0.1'},()=>{
    console.log(`server started on http://${process.env.HOST || '127.0.0.1'}:${process.env.PORT || 8080}`);  
  }) 
})
