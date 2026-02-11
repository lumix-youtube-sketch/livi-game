const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: { type: String, default: 'Livi' },
  hunger: { type: Number, default: 100, max: 100, min: 0 },
  energy: { type: Number, default: 100, max: 100, min: 0 },
  mood: { type: Number, default: 100, max: 100, min: 0 },
  lastInteraction: { type: Date, default: Date.now },
  clothingUrl: { type: String, default: null }, // URL to uploaded PNG
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// Method to decay stats over time
petSchema.methods.decay = function() {
  const now = new Date();
  const hoursPassed = (now - this.lastInteraction) / (1000 * 60 * 60);
  
  if (hoursPassed > 0.1) { // Only decay if significant time passed
    this.hunger = Math.max(0, this.hunger - (hoursPassed * 5));
    this.energy = Math.max(0, this.energy - (hoursPassed * 3));
    this.mood = Math.max(0, this.mood - (hoursPassed * 2));
    this.lastInteraction = now;
  }
};

module.exports = mongoose.model('Pet', petSchema);