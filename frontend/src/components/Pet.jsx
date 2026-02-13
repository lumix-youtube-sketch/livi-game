import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, Utensils, Smile, ClipboardList, Star, Activity, Users } from 'lucide-react';
import ModelViewer from './ModelViewer';
import { claimQuest } from '../api';
import QuestsModal from './QuestsModal';

const Pet = ({ pet, activeAction, onUpdate, bgClass }) => {
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [showQuests, setShowQuests] = useState(false);

  const addFloatingText = (text, color, icon) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, color, icon, x: Math.random() * 60 - 30, y: 0 }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(item => item.id !== id)), 1500);
  };

  useEffect(() => {
    if (activeAction) {
        if (activeAction === 'feed') addFloatingText('+15', '#ff7675', Utensils);
        if (activeAction === 'play') addFloatingText('+10', '#74b9ff', Zap);
    }
  }, [activeAction]);

  if (!pet) return null;

  return (
    <div className={bgClass} style={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden' }}>
      
      {/* HEADER: Co-op Identity */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 100 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 900, letterSpacing: '-1px' }}>{pet.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.6, fontSize: '12px', fontWeight: 700 }}>
                <Users size={12} />
                <span>RAISED WITH PARTNER</span>
            </div>
        </div>
        
        <button onClick={() => setShowQuests(true)} style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <ClipboardList size={20} color="white" />
            {pet.dailyQuests?.some(q => q.completed && !q.claimed) && <div style={{ width: '8px', height: '8px', background: '#ff7675', borderRadius: '50%', position: 'absolute', top: '8px', right: '8px' }} />}
        </button>
      </div>

      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <ModelViewer 
          type="pet" color={pet.skinColor} accessories={pet.accessories}
          isSleeping={activeAction === 'sleep'} isFeeding={activeAction === 'feed'}
          mood={pet.mood}
          style={{ height: '100%' }}
        />
      </div>

      {/* FLOATING TEXTS */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
          <AnimatePresence>
            {floatingTexts.map(item => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 0, scale: 0.5 }} animate={{ opacity: 1, y: -100, scale: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', left: `calc(50% + ${item.x}px)`, top: '40%', color: item.color, fontWeight: '900', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.icon && <item.icon size={28} fill={item.color} />}
                    {item.text}
                </motion.div>
            ))}
          </AnimatePresence>
      </div>

      {/* STATS (Clean & Minimal) */}
      <div style={{ position: 'absolute', left: '20px', top: '100px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 90 }}>
         {[
             { icon: Heart, val: pet.health, col: '#ff7675' },
             { icon: Utensils, val: pet.hunger, col: '#fdcb6e' },
             { icon: Zap, val: pet.energy, col: '#00cec9' },
             { icon: Smile, val: pet.mood, col: '#a29bfe' }
         ].map((s, i) => (
             <div key={i} style={{ width: '6px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                 <motion.div animate={{ height: `${s.val}%` }} style={{ width: '100%', background: s.col, position: 'absolute', bottom: 0 }} />
             </div>
         ))}
      </div>

      {showQuests && <QuestsModal quests={pet.dailyQuests} onClaim={async (id) => { const res = await claimQuest(pet._id, id); onUpdate(res.data.pet); }} onClose={() => setShowQuests(false)} />}
    </div>
  );
};

export default Pet;