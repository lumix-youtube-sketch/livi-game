const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: String,
  firstName: String,
  pairId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pair' }
});

module.exports = mongoose.model('User', userSchema);