import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, Coffee, Star, Trophy } from 'lucide-react';
import ModelViewer from './ModelViewer';

const Pet = ({ pet, activeAction }) => {
  const [floatingTexts, setFloatingTexts] = useState([]);
  
  const addFloatingText = (text, color, icon) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, color, icon, x: Math.random() * 40 - 20, y: 0 }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(item => item.id !== id));
    }, 1500);
  };

  useEffect(() => {
    if (activeAction) {
        if (activeAction === 'feed') addFloatingText('+15', '#ff7675', Coffee);
        if (activeAction === 'play') addFloatingText('+10', '#74b9ff', Zap);
        if (activeAction === 'sleep') addFloatingText('Zzz', '#a29bfe', Star);
    }
  }, [activeAction]);

  if (!pet) return null;

  const getMood = () => {
    if (pet.energy < 30) return 'sleepy';
    if (pet.mood < 30 || pet.hunger < 30) return 'sad';
    return 'happy';
  };

  const handlePetClick = (e) => {
      e.stopPropagation();
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
      addFloatingText('', '#ff007a', Heart);
  };

  const StatPill = ({ icon: Icon, value, color, max = 100 }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div 
        className="glass-panel"
        style={{ 
          width: '40px', height: '100px', borderRadius: '20px', 
          background: 'rgba(255,255,255,0.03)', padding: '4px',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          border: '1px solid rgba(255,255,255,0.1)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        <motion.div 
          animate={{ height: `${(value / max) * 100}%` }}
          style={{ 
            width: '100%', borderRadius: '16px', 
            background: `linear-gradient(to top, ${color}, ${color}aa)`,
            boxShadow: `0 0 10px ${color}44`
          }}
        />
        <div style={{ position: 'absolute', top: '6px', left: 0, right: 0, textAlign: 'center' }}>
            <Icon size={14} color="#fff" style={{ opacity: 0.8 }} />
        </div>
      </div>
      <span style={{ fontSize: '9px', fontWeight: '900', opacity: 0.5 }}>{Math.round(value)}%</span>
    </div>
  );

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden' }}>
      
      {/* Floating Text */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 50 }}>
          <AnimatePresence>
            {floatingTexts.map(item => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -120, scale: 1.4 }}
                    exit={{ opacity: 0 }}
                    style={{ 
                        position: 'absolute', left: `calc(50% + ${item.x}px)`, top: '45%',
                        color: item.color, fontWeight: '900', fontSize: '28px',
                        textShadow: '0 4px 0 #000', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                >
                    {item.icon && <item.icon size={28} fill={item.color} />}
                    {item.text}
                </motion.div>
            ))}
          </AnimatePresence>
      </div>

      {/* Top HUD - Adjusted to avoid top notches and back button */}
      <div style={{ position: 'absolute', top: '70px', left: '15px', right: '15px', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
        <div className="hud-capsule" style={{ padding: '6px 12px' }}>
          <div style={{ background: '#FFC312', borderRadius: '50%', padding: '5px' }}>
            <Trophy size={14} color="white" strokeWidth={3} />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 900 }}>LVL {pet.level}</span>
        </div>

        <div className="hud-capsule" style={{ padding: '6px 12px' }}>
           <div style={{ width: '24px', height: '24px' }}>
             <ModelViewer type="coin" style={{ height: '100%', minHeight: 'auto' }} />
           </div>
           <span style={{ fontSize: '16px', fontWeight: 900 }}>{pet.petCoins}</span>
        </div>
      </div>

      {/* 3D Stage */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
        <ModelViewer 
          type="pet" 
          mood={getMood()} 
          color={pet.skinColor || '#8c52ff'} 
          accessories={pet.accessories}
          activeAction={activeAction}
          onPetClick={handlePetClick}
          style={{ height: '100%' }}
        />
      </div>

      {/* Stats (Right Side) - Lowered and moved to avoid overlap with 3D model */}
      <div style={{ 
        position: 'absolute', right: '15px', bottom: '150px',
        display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 10
      }}>
        <StatPill icon={Coffee} value={pet.hunger} color="#ff7675" />
        <StatPill icon={Zap} value={pet.energy} color="#00d2ff" />
        <StatPill icon={Heart} value={pet.mood} color="#ff007a" />
      </div>
    </div>
  );
};

export default Pet;