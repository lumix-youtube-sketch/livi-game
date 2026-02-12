import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, Coffee, Star, Trophy, Clock } from 'lucide-react';
import ModelViewer from './ModelViewer';

const getAge = (date) => {
    const diff = new Date() - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
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
    if (activeAction) {
        if (activeAction === 'feed') addFloatingText('+15', '#ff7675', Coffee);
        if (activeAction === 'play') addFloatingText('+10', '#74b9ff', Zap);
        if (activeAction === 'sleep') addFloatingText('Zzz', '#a29bfe', Star);
    }
  }, [activeAction]);

  if (!pet) return null;

  const StatPill = ({ icon: Icon, value, color, max = 100 }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div className="glass-panel" style={{ width: '40px', height: '100px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', padding: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
        <motion.div animate={{ height: `${(value / max) * 100}%` }} style={{ width: '100%', borderRadius: '16px', background: `linear-gradient(to top, ${color}, ${color}aa)`, boxShadow: `0 0 10px ${color}44` }} />
        <div style={{ position: 'absolute', top: '6px', left: 0, right: 0, textAlign: 'center' }}>
            <Icon size={14} color="#fff" style={{ opacity: 0.8 }} />
        </div>
      </div>
      <span style={{ fontSize: '9px', fontWeight: '900', opacity: 0.5 }}>{Math.round(value)}%</span>
    </div>
  );

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden' }}>
      
      {/* Top HUD */}
      <div style={{ position: 'absolute', top: '70px', left: '15px', right: '15px', display: 'flex', justifyContent: 'space-between', zIndex: 100 }}>
        <div className="hud-capsule" style={{ padding: '8px 16px', borderRadius: '24px' }}>
          <div style={{ background: '#FFC312', borderRadius: '50%', padding: '5px' }}>
            <Trophy size={14} color="white" strokeWidth={3} />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 900 }}>LVL {pet.level}</span>
        </div>
        <div className="hud-capsule" style={{ padding: '8px 16px', borderRadius: '24px' }}>
           <Clock size={16} color="#00d2ff" />
           <span style={{ fontSize: '16px', fontWeight: 900 }}>{age}</span>
        </div>
      </div>

      {/* 3D Scene */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
        <Suspense fallback={null}>
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
        </Suspense>
      </div>

      {/* Stats */}
      <div style={{ position: 'absolute', right: '15px', bottom: '150px', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 100 }}>
        <StatPill icon={Coffee} value={pet.hunger} color="#ff7675" />
        <StatPill icon={Zap} value={pet.energy} color="#00d2ff" />
        <StatPill icon={Heart} value={pet.mood} color="#ff007a" />
      </div>
    </div>
  );
};

export default Pet;