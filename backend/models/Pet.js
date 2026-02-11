const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: { type: String, default: 'Livi' },
  // Stats (0-100)
  hunger: { type: Number, default: 80, max: 100, min: 0 },
  energy: { type: Number, default: 80, max: 100, min: 0 },
  mood: { type: Number, default: 80, max: 100, min: 0 },
  
  // RPG Stats
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  coins: { type: Number, default: 100 },
  
  // Appearance
  clothingUrl: { type: String, default: null },
  skinColor: { type: String, default: '#FFD700' }, // Gold by default
  
  lastInteraction: { type: Date, default: Date.now },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// Decay logic
petSchema.methods.decay = function() {
  const now = new Date();
  const hoursPassed = (now - this.lastInteraction) / (1000 * 60 * 60);
  
  if (hoursPassed > 0.1) {
    // Decay rates
    const hungerLoss = hoursPassed * 8;
    const energyLoss = hoursPassed * 5;
    const moodLoss = hoursPassed * 6;

    this.hunger = Math.max(0, this.hunger - hungerLoss);
    this.energy = Math.max(0, this.energy - energyLoss);
    this.mood = Math.max(0, this.mood - moodLoss);
    
    // Gain passive coins if happy
    if (this.mood > 50 && this.hunger > 50) {
      this.coins += Math.floor(hoursPassed * 2);
    }
    
    this.lastInteraction = now;
  }
};

module.exports = mongoose.model('Pet', petSchema);