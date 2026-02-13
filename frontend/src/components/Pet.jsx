import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, Utensils, Smile, Trophy, Clock, ClipboardList, Star } from 'lucide-react';
import ModelViewer from './ModelViewer';
import { claimQuest } from '../api';
import QuestsModal from './QuestsModal';

const getAge = (date) => {
    const diff = new Date() - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    return days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`;
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

  const StatPill = ({ icon: Icon, value, color }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div className="glass-panel" style={{ width: '42px', height: '80px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', padding: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
        <motion.div initial={false} animate={{ height: `${Math.max(10, value)}%` }} transition={{ type: 'spring', stiffness: 50, damping: 20 }} style={{ width: '100%', borderRadius: '12px', background: `linear-gradient(to top, ${color}, ${color}88)`, boxShadow: `0 0 15px ${color}33` }} />
        <div style={{ position: 'absolute', top: '8px', left: 0, right: 0, textAlign: 'center' }}><Icon size={14} color="#fff" style={{ opacity: 0.8 }} /></div>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Top HUD */}
      <div style={{ position: 'absolute', top: '75px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 100 }}>
        <div style={{ display: 'flex', gap: '8px' }}>
            <div className="hud-capsule"><Trophy size={16} color="#FFC312" /><span style={{ fontSize: '16px', fontWeight: 900 }}>{pet.level}</span></div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => setShowQuests(true)} className="hud-capsule" style={{ background: 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative' }}>
                <ClipboardList size={16} color="#fff" />
                {pet.dailyQuests?.some(q => q.completed && !q.claimed) && <div style={{ width: '8px', height: '8px', background: '#ff0055', borderRadius: '50%', position: 'absolute', top: '4px', right: '4px' }} />}
            </motion.div>
        </div>
        <div className="hud-capsule"><Clock size={16} color="#00d2ff" /><span style={{ fontSize: '16px', fontWeight: 900 }}>{age}</span></div>
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
                <motion.div key={item.id} initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: -120 }} exit={{ opacity: 0 }} style={{ position: 'absolute', left: `calc(50% + ${item.x}px)`, top: '45%', color: item.color, fontWeight: '900', fontSize: '32px', textShadow: '0 2px 10px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.icon && <item.icon size={32} fill={item.color} />}
                    {item.text}
                </motion.div>
            ))}
          </AnimatePresence>
      </div>

      {/* Stats Sidebar */}
      <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 100 }}>
        <StatPill icon={Heart} value={pet.health} color="#ff0055" />
        <StatPill icon={Utensils} value={pet.hunger} color="#ff7675" />
        <StatPill icon={Zap} value={pet.energy} color="#00d2ff" />
        <StatPill icon={Smile} value={pet.mood} color="#fdcb6e" />
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