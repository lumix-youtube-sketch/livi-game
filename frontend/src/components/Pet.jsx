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
    setFloatingTexts(prev => [...prev, { id, text, color, icon, x: Math.random() * 40 - 20, y: 0 }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(item => item.id !== id)), 1500);
  };

  useEffect(() => {
    if (activeAction) {
        if (activeAction === 'feed') addFloatingText('+15', '#ff7675', Utensils);
        if (activeAction === 'play') addFloatingText('+10', '#74b9ff', Zap);
    }
  }, [activeAction]);

  if (!pet) return null;

  const StatBar = ({ icon: Icon, value, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Icon size={10} color={color} />
        <div style={{ width: '40px', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <motion.div animate={{ width: `${Math.max(5, value)}%` }} style={{ height: '100%', background: color }} />
        </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden' }}>
      
      {/* Top Header (Smaller) */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 100 }}>
        <div className="glass-panel-ultra" style={{ padding: '6px 10px', borderRadius: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: pet.skinColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>{pet.level}</div>
            <div style={{ fontSize: '12px', fontWeight: 800 }}>{pet.name}</div>
        </div>
        <button onClick={() => setShowQuests(true)} className="glass-panel-ultra" style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={16} color="white" />
        </button>
      </div>

      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <ModelViewer 
          type="pet" color={pet.skinColor} accessories={pet.accessories}
          isSleeping={activeAction === 'sleep'} isFeeding={activeAction === 'feed'}
          style={{ height: '100%' }}
        />
      </div>

      {/* NEW STATUS POSITION: Bottom Left, Small */}
      <div style={{ position: 'absolute', left: '20px', bottom: '110px', zIndex: 90 }}>
        <div className="glass-panel-ultra" style={{ padding: '10px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.4)' }}>
            <StatBar icon={Activity} value={pet.health} color="#ff0055" />
            <StatBar icon={Utensils} value={pet.hunger} color="#ff7675" />
            <StatBar icon={Zap} value={pet.energy} color="#00d2ff" />
            <StatBar icon={Smile} value={pet.mood} color="#fdcb6e" />
        </div>
      </div>

      {showQuests && <QuestsModal quests={pet.dailyQuests} onClaim={async (id) => { const res = await claimQuest(pet._id, id); onUpdate(res.data.pet); }} onClose={() => setShowQuests(false)} />}
    </div>
  );
};

export default Pet;