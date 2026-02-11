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

// Storage for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

// Init/Auth User
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
    
    // Check if user has a pet/pair
    let pet = null;
    let pairCode = null; // Ideally user ID or special code
    
    if (user.pairId) {
      const pair = await Pair.findById(user.pairId).populate('pet');
      if (pair) {
        pet = pair.pet;
        // Check decay
        pet.decay();
        await pet.save();
      }
    }
    
    res.json({ user, pet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Join Pair (Simple implementation: One user sends their ID to another)
router.post('/pair/join', auth, async (req, res) => {
  const { targetUserId } = req.body; // telegramId of the friend
  const currentUserTelegramId = req.user.id;
  
  try {
    const currentUser = await User.findOne({ telegramId: currentUserTelegramId });
    const targetUser = await User.findOne({ telegramId: targetUserId });
    
    if (!currentUser || !targetUser) return res.status(404).json({ error: 'User not found' });
    if (currentUser.pairId || targetUser.pairId) return res.status(400).json({ error: 'Already in a pair' });
    
    // Create Pet
    const pet = new Pet({ users: [currentUser._id, targetUser._id] });
    await pet.save();
    
    // Create Pair
    const pair = new Pair({
      users: [currentUser._id, targetUser._id],
      pet: pet._id
    });
    await pair.save();
    
    // Update Users
    currentUser.pairId = pair._id;
    targetUser.pairId = pair._id;
    await currentUser.save();
    await targetUser.save();
    
    res.json({ success: true, pair, pet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Pair (Start Solo/Wait) - MVP: Just create a pet for self, allow others to join later?
// Better: "Create Link" returns ID. For MVP we'll stick to 'join by ID'.

// Pet Actions
router.post('/pet/action', auth, async (req, res) => {
  const { type } = req.body; // 'feed', 'play'
  const telegramId = req.user.id;
  
  try {
    const user = await User.findOne({ telegramId });
    if (!user || !user.pairId) return res.status(404).json({ error: 'No pet found' });
    
    const pair = await Pair.findById(user.pairId).populate('pet');
    const pet = pair.pet;
    
    if (type === 'feed') {
      pet.hunger = Math.min(100, pet.hunger + 20);
      pet.mood = Math.min(100, pet.mood + 5);
    } else if (type === 'play') {
      pet.energy = Math.max(0, pet.energy - 10);
      pet.mood = Math.min(100, pet.mood + 15);
    }
    
    pet.lastInteraction = new Date();
    await pet.save();
    
    res.json({ pet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload Clothing
router.post('/pet/upload', auth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  try {
    const user = await User.findOne({ telegramId: req.user.id });
    if (!user || !user.pairId) return res.status(404).json({ error: 'No pet found' });
    
    const pair = await Pair.findById(user.pairId).populate('pet');
    const pet = pair.pet;

    // Process image with Sharp
    const filename = `processed-${req.file.filename}`;
    const outputPath = path.join('uploads', filename);
    
    await sharp(req.file.path)
      .resize(200, 200)
      .toFile(outputPath);
      
    // Update pet (in prod, upload to S3/Cloudinary and save URL)
    // For local MVP, we serve static files
    pet.clothingUrl = `/uploads/${filename}`;
    await pet.save();
    
    // Cleanup original
    fs.unlinkSync(req.file.path);
    
    res.json({ pet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Solo Pet
router.post('/pet/create-solo', auth, async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.user.id });
    if (user.pairId) return res.status(400).json({ error: 'Already has a pet' });

    const pet = new Pet({ users: [user._id] });
    await pet.save();

    const pair = new Pair({
      users: [user._id],
      pet: pet._id
    });
    await pair.save();

    user.pairId = pair._id;
    await user.save();

    res.json({ pet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;