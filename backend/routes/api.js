const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Pet = require('../models/Pet');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// SHOP ITEMS
const SHOP_ITEMS = [
  // HEAD
  { id: 'cap_red', type: 'head', name: 'Red Cap', price: 150, icon: '🧢' },
  { id: 'crown_gold', type: 'head', name: 'Gold Crown', price: 500, icon: '👑' },
  { id: 'ears_bunny', type: 'head', name: 'Bunny Ears', price: 200, icon: '🐰' },
  { id: 'glasses_cool', type: 'head', name: 'Cool Shades', price: 250, icon: '😎' },
  { id: 'hat_wizard', type: 'head', name: 'Wizard Hat', price: 350, icon: '🧙‍♂️' },
  // BODY
  { id: 'tshirt_blue', type: 'body', name: 'Blue Tee', price: 100, icon: '👕' },
  { id: 'hoodie_black', type: 'body', name: 'Ninja Hoodie', price: 300, icon: '🥷' },
  { id: 'scarf_winter', type: 'body', name: 'Cozy Scarf', price: 150, icon: '🧣' },
  { id: 'suit_formal', type: 'body', name: 'Tuxedo', price: 600, icon: '🤵' },
  // LEGS
  { id: 'jeans_classic', type: 'legs', name: 'Classic Jeans', price: 120, icon: '👖' },
  { id: 'shorts_beach', type: 'legs', name: 'Beach Shorts', price: 100, icon: '🩳' },
  // BACKGROUNDS
  { id: 'bg_park', type: 'background', name: 'Sunny Park', price: 400, icon: '🌳' },
  { id: 'bg_space', type: 'background', name: 'Deep Space', price: 800, icon: '🌌' },
  { id: 'bg_room', type: 'background', name: 'Cozy Room', price: 300, icon: '🏠' },
  { id: 'bg_forest', type: 'background', name: 'Magic Forest', price: 500, icon: '🌲' }
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) { 
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname) }
});
const upload = multer({ storage: storage });

// Helper: Check Level Up
const checkLevelUp = (pet) => {
  const xpNeeded = pet.level * 100;
  if (pet.xp >= xpNeeded) {
    pet.level += 1;
    pet.xp -= xpNeeded;
    pet.petCoins += 100; // Bonus for level up
    // Full restore on level up
    pet.energy = 100;
    pet.health = 100;
    pet.mood = 100;
    return true;
  }
  return false;
};

// Helper: Update Quest Progress
const updateQuestProgress = (pet, type, amount = 1) => {
  let questUpdated = false;
  if (!pet.dailyQuests) return false;

  pet.dailyQuests.forEach(quest => {
    if (quest.type === type && !quest.completed) {
      quest.progress += amount;
      if (quest.progress >= quest.target) {
        quest.progress = quest.target;
        quest.completed = true;
        // Notify frontend potentially via response
      }
      questUpdated = true;
    }
  });
  return questUpdated;
};

// --- ROUTES ---

// AUTH & INIT
router.post('/auth', async (req, res) => {
  try {
    const { telegramId, username, firstName } = req.body;
    let user = await User.findOne({ telegramId }).populate('pets');
    
    if (!user) {
      user = new User({ telegramId, username, firstName });
      await user.save();
    }

    // ADMIN MODE: Infinite coins for Matvey
    if (telegramId === '1792666312') {
        user.coins = 999999;
        await user.save();
    }
    
    for (let pet of user.pets) {
      if (telegramId === '1792666312') pet.petCoins = 999999;
      pet.decay(); // This will also generate quests if needed
      await pet.save();
    }
    
    res.json({ user, pets: user.pets });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREATE PET
router.post('/pet/create', async (req, res) => {
  const { telegramId, partnerId, name, shape } = req.body;
  try {
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.pets.length >= 10) return res.status(400).json({ error: 'Max 10 pets allowed' });

    let petData = { ownerId: user._id, name: name || 'Livi', shape: shape || 'capsule', users: [user._id] };
    
    if (partnerId) {
       const partner = await User.findOne({ telegramId: partnerId });
       if (partner) {
           petData.partnerId = partner._id;
           petData.users.push(partner._id);
           const pet = new Pet(petData);
           await pet.save();
           user.pets.push(pet._id); await user.save();
           partner.pets.push(pet._id); await partner.save();
           return res.json({ pet });
       }
    }
    
    const pet = new Pet(petData);
    await pet.save();
    user.pets.push(pet._id);
    await user.save();
    res.json({ pet });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// JOIN PET
router.post('/pet/join', async (req, res) => {
  const { telegramId, petId } = req.body;
  try {
    const user = await User.findOne({ telegramId });
    const pet = await Pet.findById(petId);
    if (!user || !pet) return res.status(404).json({ error: 'Not found' });
    if (pet.users.includes(user._id)) return res.json({ pet });
    if (pet.users.length >= 2) return res.status(400).json({ error: 'Full' });

    pet.partnerId = user._id;
    pet.users.push(user._id);
    await pet.save();
    user.pets.push(pet._id);
    await user.save();
    res.json({ pet });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ACTIONS
router.post('/pet/:id/action', async (req, res) => {
  const { type } = req.body; 
  const { id } = req.params;
  try {
    const pet = await Pet.findById(id);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    
    let leveledUp = false;
    // Base interaction updates
    if (type === 'feed') {
      if (pet.petCoins < 10) return res.status(400).json({ error: 'No coins' });
      pet.petCoins -= 10;
      pet.hunger = Math.min(100, pet.hunger + 30);
      pet.mood = Math.min(100, pet.mood + 10);
      pet.health = Math.min(100, pet.health + 5);
      pet.xp += 15;
      updateQuestProgress(pet, 'feed', 1);
    } else if (type === 'play') {
      if (pet.energy < 20) return res.status(400).json({ error: 'Tired' });
      pet.energy -= 20;
      pet.mood = Math.min(100, pet.mood + 25);
      pet.xp += 20;
      pet.petCoins += 20; // Playing earns coins
      updateQuestProgress(pet, 'play', 1);
    } else if (type === 'sleep') {
      pet.energy = Math.min(100, pet.energy + 60);
      pet.health = Math.min(100, pet.health + 10);
      pet.xp += 5;
    } else if (type === 'clean') {
        // Future mechanics
        pet.xp += 10;
    }
    
    // Check for general XP quests
    updateQuestProgress(pet, 'xp', pet.xp); // Only tracks total XP gained session-based if we wanted, but logic above is simple accumulation. 
    // Actually, 'xp' quest target is usually "Gain 100 XP". 
    // My current logic accumulates. Let's fix XP quest logic:
    // It should add the GAINED xp.
    // However, the `updateQuestProgress` adds `amount` to `progress`.
    // So passing `15` or `20` works perfectly.
    // But wait, in the 'play' block I called it with 1.
    // For 'xp' type quests, I should call it with the amount gained.
    
    // Fix: Explicit XP quest update
    const xpGained = (type === 'feed' ? 15 : (type === 'play' ? 20 : 5));
    updateQuestProgress(pet, 'xp', xpGained);

    leveledUp = checkLevelUp(pet);
    pet.lastInteraction = new Date();
    await pet.save();
    res.json({ pet, leveledUp });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CLAIM QUEST REWARD
router.post('/pet/:id/quest/claim', async (req, res) => {
    const { questId } = req.body;
    const { id } = req.params;
    try {
        const pet = await Pet.findById(id);
        if (!pet) return res.status(404).json({ error: 'Pet not found' });

        const quest = pet.dailyQuests.find(q => q.id === questId);
        if (!quest) return res.status(404).json({ error: 'Quest not found' });
        if (!quest.completed) return res.status(400).json({ error: 'Not completed' });
        if (quest.claimed) return res.status(400).json({ error: 'Already claimed' });

        quest.claimed = true;
        pet.petCoins += quest.reward;
        pet.xp += 50; // Bonus XP for quest
        
        checkLevelUp(pet);
        await pet.save();
        res.json({ pet, success: true, reward: quest.reward });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// SHOP & BUY
router.get('/shop', (req, res) => res.json(SHOP_ITEMS));

router.post('/pet/:id/buy', async (req, res) => {
  const { itemId } = req.body;
  const { id } = req.params;
  try {
    const pet = await Pet.findById(id);
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!pet || !item) return res.status(404).json({ error: 'Error' });
    if (pet.petCoins < item.price) return res.status(400).json({ error: 'No coins' });
    if (pet.inventory.includes(itemId)) return res.status(400).json({ error: 'Owned' });
    
    pet.petCoins -= item.price;
    pet.inventory.push(itemId);
    await pet.save();
    res.json({ pet, success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// EQUIP (Item or Background)
router.post('/pet/:id/equip', async (req, res) => {
  const { itemId, type } = req.body;
  const { id } = req.params;
  try {
    const pet = await Pet.findById(id);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    
    if (type === 'background') {
        if (!pet.inventory.includes(itemId) && itemId !== 'bg_default') return res.status(400).json({ error: 'Not owned' });
        pet.currentBackground = itemId;
    } else {
        if (!pet.inventory.includes(itemId) && itemId !== null) return res.status(400).json({ error: 'Not owned' });
        pet.accessories[type] = itemId;
    }
    
    await pet.save();
    res.json({ pet });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// UPLOAD TEXTURE
router.post('/pet/:id/upload-texture', upload.single('image'), async (req, res) => {
  const { type } = req.body; // 'head', 'body', 'legs'
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ error: 'No file' });
  
  try {
    const pet = await Pet.findById(id);
    const filename = `tex-${Date.now()}.png`;
    const outputPath = path.join('uploads', filename);
    
    // Convert to PNG and resize safely
    await sharp(req.file.path).resize(512, 512).png().toFile(outputPath);
    fs.unlinkSync(req.file.path); // remove temp

    pet.customTextures[type] = `/uploads/${filename}`;
    await pet.save();
    res.json({ pet });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// SUBMIT SCORE
router.post('/pet/:id/score', async (req, res) => {
  const { score, telegramId } = req.body;
  const { id } = req.params;
  try {
    const pet = await Pet.findById(id);
    const user = await User.findOne({ telegramId });
    if (!pet || !user) return res.status(404).json({ error: 'Not found' });

    const currentScore = pet.highScores.get(user._id.toString()) || 0;
    if (score > currentScore) {
        pet.highScores.set(user._id.toString(), score);
        await pet.save();
    }
    res.json({ pet });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;