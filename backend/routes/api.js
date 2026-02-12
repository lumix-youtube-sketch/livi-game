const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Pet = require('../models/Pet');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Simple in-memory shop items (in production, use DB)
const SHOP_ITEMS = [
  { id: 'cap_red', type: 'head', name: 'Red Cap', price: 150, icon: '🧢' },
  { id: 'crown_gold', type: 'head', name: 'Gold Crown', price: 500, icon: '👑' },
  { id: 'tshirt_blue', type: 'body', name: 'Blue Tee', price: 100, icon: '👕' },
  { id: 'hoodie_black', type: 'body', name: 'Ninja Hoodie', price: 300, icon: '🥷' },
  { id: 'jeans_classic', type: 'legs', name: 'Classic Jeans', price: 120, icon: '👖' },
  { id: 'shorts_beach', type: 'legs', name: 'Beach Shorts', price: 80, icon: '🩳' }
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) { 
    const dir = 'uploads/';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
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
    pet.petCoins += 100; // Reward
    return true;
  }
  return false;
};

// AUTH & INIT
router.post('/auth', async (req, res) => {
  try {
    const { telegramId, username, firstName } = req.body;
    let user = await User.findOne({ telegramId }).populate('pets');
    
    if (!user) {
      user = new User({ telegramId, username, firstName });
      await user.save();
    }
    
    // Decay all pets
    for (let pet of user.pets) {
      pet.decay();
      await pet.save();
    }
    
    res.json({ user, pets: user.pets });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREATE PET (Solo or Co-op)
router.post('/pet/create', async (req, res) => {
  const { telegramId, partnerId, name } = req.body;
  try {
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (user.pets.length >= 10) return res.status(400).json({ error: 'Max 10 pets allowed' });

    let petData = { ownerId: user._id, name: name || 'Livi', users: [user._id] };
    
    // If Co-op
    if (partnerId) {
       const partner = await User.findOne({ telegramId: partnerId });
       if (partner) {
           petData.partnerId = partner._id;
           petData.users.push(partner._id);
           // Logic to add pet to partner as well
           const pet = new Pet(petData);
           await pet.save();
           
           user.pets.push(pet._id);
           await user.save();
           
           partner.pets.push(pet._id);
           await partner.save();
           return res.json({ pet });
       }
    }
    
    // Solo
    const pet = new Pet(petData);
    await pet.save();
    user.pets.push(pet._id);
    await user.save();
    
    res.json({ pet });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PET ACTIONS
router.post('/pet/:id/action', async (req, res) => {
  const { type } = req.body; 
  const { id } = req.params;
  
  try {
    const pet = await Pet.findById(id);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    
    let leveledUp = false;

    // Costs & Rewards
    if (type === 'feed') {
      if (pet.petCoins < 10) return res.status(400).json({ error: 'Not enough coins' });
      pet.petCoins -= 10;
      pet.hunger = Math.min(100, pet.hunger + 30);
      pet.mood = Math.min(100, pet.mood + 10);
      pet.xp += 15;
    } else if (type === 'play') {
      if (pet.energy < 20) return res.status(400).json({ error: 'Too tired' });
      pet.energy -= 20;
      pet.mood = Math.min(100, pet.mood + 25);
      pet.xp += 20;
      pet.petCoins += 20; // Earn coins
    } else if (type === 'sleep') {
      pet.energy = Math.min(100, pet.energy + 60);
      pet.xp += 5;
    }

    leveledUp = checkLevelUp(pet);
    pet.lastInteraction = new Date();
    await pet.save();
    
    res.json({ pet, leveledUp });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// SHOP
router.get('/shop', (req, res) => {
  res.json(SHOP_ITEMS);
});

router.post('/pet/:id/buy', async (req, res) => {
  const { itemId } = req.body;
  const { id } = req.params;
  try {
    const pet = await Pet.findById(id);
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    
    if (!pet || !item) return res.status(404).json({ error: 'Not found' });
    if (pet.petCoins < item.price) return res.status(400).json({ error: 'Not enough coins' });
    if (pet.inventory.includes(itemId)) return res.status(400).json({ error: 'Already owned' });
    
    pet.petCoins -= item.price;
    pet.inventory.push(itemId);
    await pet.save();
    
    res.json({ pet, success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// EQUIP
router.post('/pet/:id/equip', async (req, res) => {
  const { itemId, type } = req.body; // type: 'head', 'body', 'legs'
  const { id } = req.params;
  try {
    const pet = await Pet.findById(id);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    if (!pet.inventory.includes(itemId) && itemId !== null) return res.status(400).json({ error: 'Item not owned' });
    
    pet.accessories[type] = itemId;
    await pet.save();
    
    res.json({ pet });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// JOIN PET BY ID (Referral)
router.post('/pet/join', async (req, res) => {
  const { telegramId, petId } = req.body;
  try {
    const user = await User.findOne({ telegramId });
    const pet = await Pet.findById(petId);
    
    if (!user || !pet) return res.status(404).json({ error: 'Not found' });
    if (pet.users.includes(user._id)) return res.json({ pet }); // Already in
    if (pet.users.length >= 2) return res.status(400).json({ error: 'Pet already has 2 owners' });

    pet.partnerId = user._id;
    pet.users.push(user._id);
    await pet.save();

    user.pets.push(pet._id);
    await user.save();

    res.json({ pet });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;