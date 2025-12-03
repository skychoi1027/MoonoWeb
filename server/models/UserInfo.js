const mongoose = require('mongoose');

const userInfoSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    default: ''
  },
  birthDate: {
    type: String,
    default: ''
  },
  birthTime: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserInfo', userInfoSchema);

