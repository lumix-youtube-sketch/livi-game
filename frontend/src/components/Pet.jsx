import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, Coffee, Star, Trophy, Sparkles } from 'lucide-react';
import ModelViewer from './ModelViewer';

const Pet = ({ pet, activeAction }) => {
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [clickCount, setClickCount] = useState(0);

  // Add floating text
  const addFloatingText = (text, color, icon) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, color, icon, x: Math.random() * 40 - 20, y: 0 }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(item => item.id !== id));
    }, 1500);
  };

  // React to actions from parent
  useEffect(() => {
    if (activeAction) {
        if (activeAction === 'feed') addFloatingText('+15', '#ff7675', Coffee);
        if (activeAction === 'play') addFloatingText('+10', '#74b9ff', Zap);
        if (activeAction === 'sleep') addFloatingText('Zzz', '#a29bfe', Star);
    }
  }, [activeAction]);

  if (!pet) return null;

  // Map backend stats to 3D mood
  const getMood = () => {
    if (pet.energy < 30) return 'sleepy';
    if (pet.mood < 30 || pet.hunger < 30) return 'sad';
    return 'happy';
  };

  const handlePetClick = (e) => {
      // Prevent double trigger on mobile tap
      e.stopPropagation();
      setClickCount(prev => prev + 1);
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
      addFloatingText('', '#fd79a8', Heart);
  };

  const StatPill = ({ icon: Icon, value, color, max = 100 }) => (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
      opacity: value < 30 ? 0.6 : 1, transition: 'opacity 0.3s'
    }}>
      <div 
        className="glass-panel"
        style={{ 
          width: '50px', height: '140px', borderRadius: '25px', 
          background: 'rgba(255,255,255,0.4)', padding: '6px',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.3)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: `${(value / max) * 100}%` }}
          transition={{ type: 'spring', stiffness: 40, damping: 15 }}
          style={{ 
            width: '100%', borderRadius: '20px', 
            background: `linear-gradient(to top, ${color}, ${color}dd)`,
            boxShadow: `0 0 15px ${color}66`
          }}
        />
        <div style={{ position: 'absolute', top: '10px', left: 0, right: 0, textAlign: 'center' }}>
            <Icon size={20} color={value > 50 ? (value > 80 ? color : '#7f8c8d') : '#7f8c8d'} style={{ opacity: 0.8 }} />
        </div>
      </div>
      <span style={{ fontSize: '12px', fontWeight: '800', opacity: 0.6 }}>{Math.round(value)}%</span>
    </div>
  );

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      
      {/* Floating Text Overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 50 }}>
          <AnimatePresence>
            {floatingTexts.map(item => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 0, scale: 0.5, rotate: Math.random() * 20 - 10 }}
                    animate={{ opacity: 1, y: -150, scale: 1.5 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ 
                        position: 'absolute', 
                        left: `calc(50% + ${item.x}px)`, 
                        top: '40%',
                        color: item.color,
                        fontWeight: '900',
                        fontSize: '32px',
                        textShadow: '0 4px 0 #fff, 0 0 20px rgba(0,0,0,0.1)',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        zIndex: 100
                    }}
                >
                    {item.icon && <item.icon size={32} fill={item.color} />}
                    {item.text}
                </motion.div>
            ))}
          </AnimatePresence>
      </div>

      {/* Top HUD */}
      <div style={{ 
        position: 'absolute', top: '10px', left: '20px', right: '20px', 
        display: 'flex', justifyContent: 'space-between', zIndex: 10 
      }}>
        {/* Level */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="hud-capsule"
        >
          <div style={{ background: '#FFC312', borderRadius: '50%', padding: '6px', boxShadow: '0 2px 5px rgba(255, 195, 18, 0.4)' }}>
            <Trophy size={16} color="white" strokeWidth={3} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase' }}>Level</span>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#2d3436' }}>{pet.level}</span>
          </div>
        </motion.div>

        {/* Coins */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="hud-capsule"
          style={{ paddingRight: '16px' }}
        >
           <div style={{ width: '32px', height: '32px', marginRight: '-5px' }}>
             <ModelViewer type="coin" style={{ height: '100%', minHeight: 'auto' }} />
           </div>
           <span style={{ fontSize: '18px', fontWeight: 900, color: '#2d3436' }}>{pet.coins}</span>
        </motion.div>
      </div>

      {/* Main 3D Stage */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, height: '80%', 
        zIndex: 1 
      }}>
        <ModelViewer 
          type="pet" 
          mood={getMood()} 
          color={pet.skinColor || '#FFD700'} 
          activeAction={activeAction}
          onPetClick={handlePetClick}
          style={{ height: '100%' }}
        />
        
        {/* Clothing Overlay (if any, positioned absolutely over the canvas area) */}
        {pet.clothingUrl && (
          <div style={{ 
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
            width: '250px', height: '250px', pointerEvents: 'none', zIndex: 5 
          }}>
            <img src={`https://livi-backend.onrender.com${pet.clothingUrl}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        )}
      </div>

      {/* Right Side Stats Pills */}
      <div style={{ 
        position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 10
      }}>
        <StatPill icon={Coffee} value={pet.hunger} color="#ff7675" />
        <StatPill icon={Zap} value={pet.energy} color="#74b9ff" />
        <StatPill icon={Heart} value={pet.mood} color="#fd79a8" />
      </div>

    </div>
  );
};

export default Pet;