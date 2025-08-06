const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name must be provided'],
    minlength: 3,
    maxlength: 100,
  },

  email: { type: String, required: [true, 'Email must be provided'] },

  password: {
    type: String,
    required: [true, 'Password must be provided'],
  },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
});

module.exports = mongoose.model('User', UserSchema);
