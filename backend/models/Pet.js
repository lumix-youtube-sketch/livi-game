const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: { type: String, default: 'Livi' },
  // Identifying the pair/owner
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Creator
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional Co-op partner
  
  // Stats (0-100)
  hunger: { type: Number, default: 80, max: 100, min: 0 },
  energy: { type: Number, default: 80, max: 100, min: 0 },
  mood: { type: Number, default: 80, max: 100, min: 0 },
  
  // RPG Stats
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  petCoins: { type: Number, default: 100 }, // Coins earned by this specific pet
  
  // Appearance & Accessories
  skinColor: { type: String, default: '#8c52ff' },
  shape: { type: String, default: 'capsule' },
  currentBackground: { type: String, default: 'bg_default' },
  
  accessories: {
    head: { type: String, default: null },
    body: { type: String, default: null },
    legs: { type: String, default: null }
  },
  
  // Custom Textures for Accessories (URL to uploaded image)
  customTextures: {
    head: { type: String, default: null },
    body: { type: String, default: null },
    legs: { type: String, default: null }
  },

  // Game Records: { userId: score }
  highScores: { type: Map, of: Number, default: {} },
  
  // Inventory
  inventory: [{ type: String }], 
  
  lastInteraction: { type: Date, default: Date.now }
});

// Decay logic
petSchema.methods.decay = function() {
  const now = new Date();
  const hoursPassed = (now - this.lastInteraction) / (1000 * 60 * 60);
  
  if (hoursPassed > 0.1) {
    const hungerLoss = hoursPassed * 8;
    const energyLoss = hoursPassed * 5;
    const moodLoss = hoursPassed * 6;

    this.hunger = Math.max(0, this.hunger - hungerLoss);
    this.energy = Math.max(0, this.energy - energyLoss);
    this.mood = Math.max(0, this.mood - moodLoss);
    
    if (this.mood > 50 && this.hunger > 50) {
      this.petCoins += Math.floor(hoursPassed * 2);
    }
    
    this.lastInteraction = now;
  }
};

module.exports = mongoose.model('Pet', petSchema);