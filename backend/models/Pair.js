const mongoose = require('mongoose');

const pairSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pair', pairSchema);