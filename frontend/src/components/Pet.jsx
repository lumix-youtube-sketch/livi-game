import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, Utensils, Smile, Trophy, Clock, ClipboardList, Star, Activity } from 'lucide-react';
import ModelViewer from './ModelViewer';
import { claimQuest } from '../api';
import QuestsModal from './QuestsModal';

const getAge = (date) => {
    const diff = new Date() - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    if (days > 0) return `${days}d`;
    return `${hours}h`;
};

const Pet = ({ pet, activeAction, onUpdate }) => {
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [age, setAge] = useState(getAge(pet.createdAt));
  const [showQuests, setShowQuests] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setAge(getAge(pet.createdAt)), 60000);
    return () => clearInterval(timer);
  }, [pet.createdAt]);

  const addFloatingText = (text, color, icon) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, color, icon, x: Math.random() * 60 - 30, y: 0 }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(item => item.id !== id));
    }, 2000);
  };

  useEffect(() => {
    if (activeAction && activeAction !== 'sleep') {
        if (activeAction === 'feed') addFloatingText('+15', '#ff7675', Utensils);
        if (activeAction === 'play') addFloatingText('+10', '#74b9ff', Zap);
    }
  }, [activeAction]);
  
  const handleClaimQuest = async (questId) => {
      try {
          const res = await claimQuest(pet._id, questId);
          if (res.data.success) {
            onUpdate(res.data.pet);
            addFloatingText(`+${res.data.reward}`, '#FFD700', Star);
          }
      } catch (err) {
          console.error(err);
      }
  };

  if (!pet) return null;

  const StatBar = ({ icon: Icon, value, color, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={14} color={color} />
        </div>
        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', width: '80px' }}>
            <motion.div 
                initial={false} 
                animate={{ width: `${Math.max(5, value)}%` }} 
                transition={{ type: 'spring', stiffness: 40, damping: 15 }} 
                style={{ height: '100%', background: color, boxShadow: `0 0 10px ${color}` }} 
            />
        </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden', background: 'radial-gradient(circle at 50% 50%, #1e1e24 0%, #000 100%)' }}>
      
      {/* Background Decor */}
      <div className="nebula-bg" />

      {/* Top HUD */}
      <div style={{ position: 'absolute', top: '70px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 100 }}>
        
        {/* Left: Identity */}
        <div className="glass-panel-ultra" style={{ padding: '12px 16px', borderRadius: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `linear-gradient(135deg, ${pet.skinColor}, #a29bfe)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, boxShadow: `0 0 15px ${pet.skinColor}66` }}>
                {pet.level}
            </div>
            <div>
                <div style={{ fontSize: '16px', fontWeight: 900, lineHeight: 1 }}>{pet.name}</div>
                <div style={{ fontSize: '11px', opacity: 0.6, fontWeight: 700, letterSpacing: '0.5px' }}>{age} TOGETHER</div>
            </div>
        </div>

        {/* Right: Quests & XP */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
            <motion.button 
                whileTap={{ scale: 0.9 }} 
                onClick={() => setShowQuests(true)} 
                className="glass-panel-ultra" 
                style={{ width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
            >
                <ClipboardList size={20} color="white" />
                {pet.dailyQuests?.some(q => q.completed && !q.claimed) && <div style={{ width: '10px', height: '10px', background: '#ff0055', borderRadius: '50%', position: 'absolute', top: '8px', right: '8px', border: '2px solid #1e1e24' }} />}
            </motion.button>
            
             <div className="glass-panel-ultra" style={{ padding: '8px 12px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={12} color="#fdcb6e" fill="#fdcb6e" />
                <span className="hud-text" style={{ fontSize: '12px', fontWeight: 700 }}>{pet.xp} XP</span>
            </div>
        </div>
      </div>

      {/* 3D Scene */}
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

      {/* Floating Text Overlay */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
          <AnimatePresence>
            {floatingTexts.map(item => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 0, scale: 0.5 }} animate={{ opacity: 1, y: -150, scale: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', left: `calc(50% + ${item.x}px)`, top: '40%', color: item.color, fontWeight: '900', fontSize: '36px', textShadow: '0 0 20px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Rajdhani' }}>
                    {item.icon && <item.icon size={36} fill={item.color} />}
                    {item.text}
                </motion.div>
            ))}
          </AnimatePresence>
      </div>

      {/* Stats Panel (Right Side) */}
      <div style={{ position: 'absolute', right: '20px', top: '55%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 90 }}>
        <div className="glass-panel-ultra" style={{ padding: '16px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <StatBar icon={Activity} value={pet.health} color="#ff0055" label="HP" />
            <StatBar icon={Utensils} value={pet.hunger} color="#ff7675" label="FD" />
            <StatBar icon={Zap} value={pet.energy} color="#00d2ff" label="EN" />
            <StatBar icon={Smile} value={pet.mood} color="#fdcb6e" label="MD" />
        </div>
      </div>

      {/* Quest Modal */}
      {showQuests && (
          <QuestsModal 
            quests={pet.dailyQuests} 
            onClaim={handleClaimQuest} 
            onClose={() => setShowQuests(false)} 
          />
      )}
    </div>
  );
};

export default Pet;