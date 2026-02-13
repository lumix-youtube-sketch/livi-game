import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, Utensils, Smile, ClipboardList, Star, Activity } from 'lucide-react';
import ModelViewer from './ModelViewer';
import { claimQuest } from '../api';
import QuestsModal from './QuestsModal';

const Pet = ({ pet, activeAction, onUpdate }) => {
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [showQuests, setShowQuests] = useState(false);

  const addFloatingText = (text, color, icon) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, color, icon, x: Math.random() * 60 - 30, y: 0 }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(item => item.id !== id));
    }, 1500);
  };

  useEffect(() => {
    if (activeAction) {
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
      } catch (err) { console.error(err); }
  };

  if (!pet) return null;

  const StatBar = ({ icon: Icon, value, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ width: '22px', height: '22px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={12} color={color} />
        </div>
        <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', width: '60px' }}>
            <motion.div 
                initial={false} 
                animate={{ width: `${Math.max(5, value)}%` }} 
                transition={{ type: 'spring', stiffness: 40, damping: 15 }} 
                style={{ height: '100%', background: color, boxShadow: `0 0 10px ${color}66` }} 
            />
        </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden' }}>
      
      {/* HUD HEADER */}
      <div style={{ position: 'absolute', top: '25px', right: '25px', display: 'flex', gap: '12px', alignItems: 'center', zIndex: 100 }}>
        <div className="glass-panel-ultra" style={{ padding: '8px 12px', borderRadius: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '10px', background: pet.skinColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, boxShadow: `0 0 15px ${pet.skinColor}66` }}>
                {pet.level}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800 }}>{pet.name}</div>
        </div>

        <motion.button 
            whileTap={{ scale: 0.9 }} 
            onClick={() => setShowQuests(true)} 
            className="glass-panel-ultra"
            style={{ width: '42px', height: '42px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}
        >
            <ClipboardList size={20} color="white" />
            {pet.dailyQuests?.some(q => q.completed && !q.claimed) && <div style={{ width: '8px', height: '8px', background: '#ff0055', borderRadius: '50%', position: 'absolute', top: '8px', right: '8px', border: '2px solid #050508' }} />}
        </motion.button>
      </div>

      {/* 3D SCENE */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <ModelViewer 
          type="pet" 
          color={pet.skinColor} 
          accessories={pet.accessories}
          isSleeping={activeAction === 'sleep'} 
          isFeeding={activeAction === 'feed'}
          isPlaying={activeAction === 'play'}
          mood={pet.mood}
          onPetClick={() => {
              try { window.Telegram.WebApp.HapticFeedback.impactOccurred('light'); } catch(e) {}
              addFloatingText('', '#ff007a', Heart);
          }}
          style={{ height: '100%' }}
        />
      </div>

      {/* FLOATING TEXTS */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
          <AnimatePresence>
            {floatingTexts.map(item => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 0, scale: 0.5 }} animate={{ opacity: 1, y: -120, scale: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', left: `calc(50% + ${item.x}px)`, top: '40%', color: item.color, fontWeight: '900', fontSize: '32px', textShadow: '0 5px 15px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.icon && <item.icon size={32} fill={item.color} />}
                    {item.text}
                </motion.div>
            ))}
          </AnimatePresence>
      </div>

      {/* STATS PANEL */}
      <div style={{ position: 'absolute', right: '25px', top: '50%', transform: 'translateY(-50%)', zIndex: 90 }}>
        <div className="glass-panel-ultra" style={{ padding: '15px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '5px', background: 'rgba(10,10,15,0.6)' }}>
            <StatBar icon={Activity} value={pet.health} color="#ff0055" />
            <StatBar icon={Utensils} value={pet.hunger} color="#ff7675" />
            <StatBar icon={Zap} value={pet.energy} color="#00d2ff" />
            <StatBar icon={Smile} value={pet.mood} color="#fdcb6e" />
        </div>
      </div>

      {showQuests && (
          <QuestsModal quests={pet.dailyQuests} onClaim={handleClaimQuest} onClose={() => setShowQuests(false)} />
      )}
    </div>
  );
};

export default Pet;