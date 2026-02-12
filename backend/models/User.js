const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: String,
  firstName: String,
  // Array of pets this user owns (Solo or Co-op)
  pets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],
  coins: { type: Number, default: 500 } // Global currency for user to buy generic items
});

module.exports = mongoose.model('User', userSchema);