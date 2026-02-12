import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, Coffee, Star, Trophy, Clock } from 'lucide-react';
import ModelViewer from './ModelViewer';

const getAge = (date) => {
    const diff = new Date() - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    return days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`;
};

const Pet = ({ pet, activeAction }) => {
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [age, setAge] = useState(getAge(pet.createdAt));

  useEffect(() => {
    const timer = setInterval(() => setAge(getAge(pet.createdAt)), 60000);
    return () => clearInterval(timer);
  }, [pet.createdAt]);

  const addFloatingText = (text, color, icon) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, color, icon, x: Math.random() * 40 - 20, y: 0 }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(item => item.id !== id));
    }, 1500);
  };

  useEffect(() => {
    if (activeAction && activeAction !== 'sleep') { // Не спамим текстом во время сна
        if (activeAction === 'feed') addFloatingText('+15', '#ff7675', Coffee);
        if (activeAction === 'play') addFloatingText('+10', '#74b9ff', Zap);
    }
  }, [activeAction]);

  if (!pet) return null;

  const StatPill = ({ icon: Icon, value, color }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div className="glass-panel" style={{ width: '42px', height: '110px', borderRadius: '22px', background: 'rgba(255,255,255,0.02)', padding: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
        <motion.div 
          initial={false}
          animate={{ height: `${Math.max(10, value)}%` }} 
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          style={{ width: '100%', borderRadius: '18px', background: `linear-gradient(to top, ${color}, ${color}88)`, boxShadow: `0 0 15px ${color}33` }} 
        />
        <div style={{ position: 'absolute', top: '8px', left: 0, right: 0, textAlign: 'center' }}>
            <Icon size={16} color="#fff" style={{ opacity: 0.8 }} />
        </div>
      </div>
      <span style={{ fontSize: '10px', fontWeight: '900', opacity: 0.4 }}>{Math.round(value)}%</span>
    </div>
  );

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden' }}>
      
      {/* Top HUD */}
      <div style={{ position: 'absolute', top: '75px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 100 }}>
        <div className="hud-capsule">
          <Trophy size={16} color="#FFC312" />
          <span style={{ fontSize: '16px', fontWeight: 900 }}>LVL {pet.level}</span>
        </div>
        <div className="hud-capsule">
           <Clock size={16} color="#00d2ff" />
           <span style={{ fontSize: '16px', fontWeight: 900 }}>{age}</span>
        </div>
      </div>

      {/* 3D Stage */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <ModelViewer 
          type="pet" 
          color={pet.skinColor} 
          shape={pet.shape}
          accessories={pet.accessories}
          customTextures={pet.customTextures}
          background={pet.currentBackground}
          onPetClick={() => {
              if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
              addFloatingText('', '#ff007a', Heart);
          }}
          style={{ height: '100%' }}
        />
      </div>

      {/* Floating Text */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
          <AnimatePresence>
            {floatingTexts.map(item => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: -100 }} exit={{ opacity: 0 }} style={{ position: 'absolute', left: `calc(50% + ${item.x}px)`, top: '45%', color: item.color, fontWeight: '900', fontSize: '32px', textShadow: '0 2px 10px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.icon && <item.icon size={32} fill={item.color} />}
                    {item.text}
                </motion.div>
            ))}
          </AnimatePresence>
      </div>

      {/* Stats - Locked in place */}
      <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '18px', zIndex: 100 }}>
        <StatPill icon={Coffee} value={pet.hunger} color="#ff7675" />
        <StatPill icon={Zap} value={pet.energy} color="#00d2ff" />
        <StatPill icon={Heart} value={pet.mood} color="#ff007a" />
      </div>
    </div>
  );
};

export default Pet;