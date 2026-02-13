const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: { type: String, default: 'Livi' },
  // Identifying the pair/owner
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Creator
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional Co-op partner
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // All owners
  
  // Stats (0-100)
  hunger: { type: Number, default: 80, max: 100, min: 0 },
  energy: { type: Number, default: 80, max: 100, min: 0 },
  mood: { type: Number, default: 80, max: 100, min: 0 },
  
  // RPG Stats
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  health: { type: Number, default: 100, max: 100, min: 0 },
  petCoins: { type: Number, default: 100 }, // Coins earned by this specific pet
  
  // Daily Quests System
  dailyQuests: [{
    id: String,
    title: String,
    type: String, // 'feed', 'play', 'clean', 'train'
    target: Number,
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    claimed: { type: Boolean, default: false },
    reward: Number
  }],
  lastDailyReset: { type: Date, default: Date.now },

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
  
  createdAt: { type: Date, default: Date.now },
  lastInteraction: { type: Date, default: Date.now }
}, {
  toJSON: { flattenMaps: true },
  toObject: { flattenMaps: true }
});

// Helper to generate quests
const generateDailyQuests = () => {
  const tasks = [
    { id: 'feed_5', title: 'Покормить 5 раз', type: 'feed', target: 5, reward: 50 },
    { id: 'play_3', title: 'Сыграть 3 раза', type: 'play', target: 3, reward: 60 },
    { id: 'xp_100', title: 'Получить 100 XP', type: 'xp', target: 100, reward: 80 }
  ];
  // Randomly pick 3
  return tasks.map(t => ({ ...t, progress: 0, completed: false })); // Simplified for now, just static set
};

petSchema.methods.decay = function() {
  const now = new Date();
  const hoursPassed = (now - this.lastInteraction) / (1000 * 60 * 60); // Hours
  
  // Daily Reset Check
  const lastReset = new Date(this.lastDailyReset);
  if (now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth()) {
    this.dailyQuests = generateDailyQuests();
    this.lastDailyReset = now;
    // Restore some health on new day
    this.health = Math.min(100, this.health + 20);
  }

  if (hoursPassed > 0.1) {
    const hungerLoss = hoursPassed * 5; // Reduced rate
    const energyLoss = hoursPassed * 3;
    const moodLoss = hoursPassed * 4;

    this.hunger = Math.max(0, this.hunger - hungerLoss);
    this.energy = Math.max(0, this.energy - energyLoss);
    this.mood = Math.max(0, this.mood - moodLoss);
    
    // Health decay if starving
    if (this.hunger < 10) {
      this.health = Math.max(0, this.health - (hoursPassed * 2));
    }

    // Passive coin generation only if healthy and happy
    if (this.mood > 70 && this.hunger > 70 && this.health > 80) {
      // Very slow passive gain
      this.petCoins += Math.floor(hoursPassed * 1); 
    }
    
    this.lastInteraction = now;
  }
};

module.exports = mongoose.model('Pet', petSchema);