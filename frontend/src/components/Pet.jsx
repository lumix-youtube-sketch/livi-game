import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, Utensils, Smile, Trophy, Clock, ClipboardList, Star, Activity } from 'lucide-react';
import ModelViewer from './ModelViewer';
import { claimQuest } from '../api';
import QuestsModal from './QuestsModal';

const getAge = (date) => {
    const diff = new Date() - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d`;
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
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
    setFloatingTexts(prev => [...prev, { id, text, color, icon, x: Math.random() * 40 - 20, y: 0 }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(item => item.id !== id));
    }, 1500);
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

  const StatBar = ({ icon: Icon, value, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <div style={{ width: '20px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={10} color={color} />
        </div>
        <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', width: '50px' }}>
            <motion.div 
                initial={false} 
                animate={{ width: `${Math.max(5, value)}%` }} 
                transition={{ type: 'spring', stiffness: 40, damping: 15 }} 
                style={{ height: '100%', background: color }} 
            />
        </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden', background: '#050508' }}>
      
      {/* Top HUD (Compact) */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px', alignItems: 'center', zIndex: 90 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '12px', display: 'flex', gap: '8px', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: pet.skinColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>
                {pet.level}
            </div>
            <div>
                <div style={{ fontSize: '12px', fontWeight: 800 }}>{pet.name}</div>
                <div style={{ fontSize: '9px', opacity: 0.5 }}>{age}</div>
            </div>
        </div>

        <motion.button 
            whileTap={{ scale: 0.9 }} 
            onClick={() => setShowQuests(true)} 
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '1px solid rgba(255,255,255,0.05)' }}
        >
            <ClipboardList size={16} color="white" />
            {pet.dailyQuests?.some(q => q.completed && !q.claimed) && <div style={{ width: '6px', height: '6px', background: '#ff0055', borderRadius: '50%', position: 'absolute', top: '6px', right: '6px' }} />}
        </motion.button>
      </div>

      {/* 3D Scene */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <ModelViewer 
          type="pet" 
          color={pet.skinColor} 
          shape={pet.shape}
          accessories={pet.accessories}
          customTextures={pet.customTextures}
          // Pass new props
          isSleeping={activeAction === 'sleep'} 
          mood={pet.mood}
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
                <motion.div key={item.id} initial={{ opacity: 0, y: 0, scale: 0.5 }} animate={{ opacity: 1, y: -100, scale: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', left: `calc(50% + ${item.x}px)`, top: '40%', color: item.color, fontWeight: '900', fontSize: '24px', textShadow: '0 0 10px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {item.icon && <item.icon size={24} fill={item.color} />}
                    {item.text}
                </motion.div>
            ))}
          </AnimatePresence>
      </div>

      {/* Stats Panel (Right Side - Compact) */}
      <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 90 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <StatBar icon={Activity} value={pet.health} color="#ff0055" />
            <StatBar icon={Utensils} value={pet.hunger} color="#ff7675" />
            <StatBar icon={Zap} value={pet.energy} color="#00d2ff" />
            <StatBar icon={Smile} value={pet.mood} color="#fdcb6e" />
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