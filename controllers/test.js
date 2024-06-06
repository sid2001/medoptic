const {admin}  = require('../services/firebase.js');
const getUsers = (req, res, next) => {
  admin.auth().listUsers()
  .then((data)=>{
    const payload = {
      users: data.users
    }
    console.log(data.users[0].providerData);
    res.status(200).json(JSON.stringify(payload));
  })
  .catch((error)=>{
    console.error(error);
  })
}

module.exports.getUsers = getUsers;