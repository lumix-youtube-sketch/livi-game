const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Pet = require('../models/Pet');
const Pair = require('../models/Pair');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'uploads/') },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname) }
});
const upload = multer({ storage: storage });

// Helper to check level up
const checkLevelUp = (pet) => {
  const xpNeeded = pet.level * 100;
  if (pet.xp >= xpNeeded) {
    pet.level += 1;
    pet.xp -= xpNeeded;
    pet.coins += 50; // Level up reward
    return true;
  }
  return false;
};

router.post('/auth', auth, async (req, res) => {
  try {
    const telegramUser = req.user;
    let user = await User.findOne({ telegramId: telegramUser.id });
    if (!user) {
      user = new User({
        telegramId: telegramUser.id,
        username: telegramUser.username,
        firstName: telegramUser.first_name
      });
      await user.save();
    }
    
    let pet = null;
    if (user.pairId) {
      const pair = await Pair.findById(user.pairId).populate('pet');
      if (pair) {
        pet = pair.pet;
        pet.decay();
        await pet.save();
      }
    }
    res.json({ user, pet });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/pair/join', auth, async (req, res) => {
  const { targetUserId } = req.body;
  const currentUserTelegramId = req.user.id;
  try {
    const currentUser = await User.findOne({ telegramId: currentUserTelegramId });
    const targetUser = await User.findOne({ telegramId: targetUserId });
    
    if (!currentUser || !targetUser) return res.status(404).json({ error: 'User not found' });
    if (currentUser.pairId || targetUser.pairId) return res.status(400).json({ error: 'Already in a pair' });
    
    const pet = new Pet({ users: [currentUser._id, targetUser._id] });
    await pet.save();
    const pair = new Pair({ users: [currentUser._id, targetUser._id], pet: pet._id });
    await pair.save();
    
    currentUser.pairId = pair._id;
    targetUser.pairId = pair._id;
    await currentUser.save();
    await targetUser.save();
    
    res.json({ success: true, pair, pet });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/pet/create-solo', auth, async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.user.id });
    if (user.pairId) return res.status(400).json({ error: 'Already has a pet' });
    const pet = new Pet({ users: [user._id] });
    await pet.save();
    const pair = new Pair({ users: [user._id], pet: pet._id });
    await pair.save();
    user.pairId = pair._id;
    await user.save();
    res.json({ pet });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Enhanced Action Route
router.post('/pet/action', auth, async (req, res) => {
  const { type } = req.body; 
  const telegramId = req.user.id;
  
  try {
    const user = await User.findOne({ telegramId });
    if (!user || !user.pairId) return res.status(404).json({ error: 'No pet found' });
    
    const pair = await Pair.findById(user.pairId).populate('pet');
    const pet = pair.pet;
    let leveledUp = false;

    // Costs and Rewards
    if (type === 'feed') {
      if (pet.coins < 10) return res.status(400).json({ error: 'Not enough coins (10 needed)' });
      pet.coins -= 10;
      pet.hunger = Math.min(100, pet.hunger + 30);
      pet.mood = Math.min(100, pet.mood + 10);
      pet.xp += 15;
    } else if (type === 'play') {
      if (pet.energy < 20) return res.status(400).json({ error: 'Too tired to play!' });
      pet.energy -= 20;
      pet.mood = Math.min(100, pet.mood + 25);
      pet.xp += 20;
      pet.coins += 15; // Playing earns coins
    } else if (type === 'sleep') {
      pet.energy = Math.min(100, pet.energy + 50);
      pet.hunger = Math.max(0, pet.hunger - 10);
      pet.xp += 5;
    }

    leveledUp = checkLevelUp(pet);
    pet.lastInteraction = new Date();
    await pet.save();
    
    res.json({ pet, leveledUp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/pet/upload', auth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const user = await User.findOne({ telegramId: req.user.id });
    const pair = await Pair.findById(user.pairId).populate('pet');
    const pet = pair.pet;

    const filename = `processed-${req.file.filename}`;
    const outputPath = path.join('uploads', filename);
    await sharp(req.file.path).resize(250, 250).toFile(outputPath);
      
    pet.clothingUrl = `/uploads/${filename}`;
    await pet.save();
    fs.unlinkSync(req.file.path);
    
    res.json({ pet });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;