const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');


// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});


UserSchema.statics.findByToken = function (token) {

  
  var User = this;
  var decoded;

  try {
    console.log(token);
      decoded = jwt.verify(token, 'abc123');
     
  } catch (e) {
      return Promise.reject();
  }

  return User.findOne({
      '_id': decoded._id
  });
};


module.exports = User = mongoose.model('users', UserSchema);
