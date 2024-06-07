class User{
  constructor(user){
    this.uid = user.uid;
    this.name = user.displayName;
    this.email = user.email;
    this.phone = user.phoneNumber;
  }

  getData(){
    return {
      "uid": this.uid,
      "name": this.name,
      "email": this.email,
      "phone": this.phone
    }
  }
}

module.exports = User