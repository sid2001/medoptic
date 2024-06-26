const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  name:{
    type: String,
    required: true
  },
  storeName:{
    type: String,
  },
  storeAddress:{
    type: String
  },
  //email:{
    //address: String,
    //verified: Boolean
  //},
  profilePic:{
    type: String
  },
  phone:{
    type: String,
    required: true
  },
  token:String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: undefined}
})

const User = mongoose.model('User', userSchema);

module.exports = User