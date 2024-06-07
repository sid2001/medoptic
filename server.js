const express = require('express');
const cors = require('cors'); 
const testRoutes = require('./routes/test');
const mtagRoutes = require('./routes/mtag');
const userRoutes = require('./routes/user');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

// app.use('/test', testRoutes);
app.use('/mtag', mtagRoutes);
app.use('/user', userRoutes);

app.listen({port: process.env.PORT || 8080,host:process.env.HOST || '127.0.0.1'},()=>{
  console.log(`server started on http://${process.env.HOST || '127.0.0.1'}:${process.env.PORT || 8080}`);  
})