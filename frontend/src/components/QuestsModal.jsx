import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const QuestsModal = ({ quests, onClaim, onClose }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '90%', maxWidth: '400px', background: '#1e1e24', borderRadius: '24px', padding: '24px', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'white' }}><X size={24} /></button>
        <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '20px', color: 'white' }}>Daily Quests</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {quests && quests.map(quest => (
            <div key={quest.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 800, color: 'white', marginBottom: '4px' }}>{quest.title}</div>
                <div style={{ fontSize: '12px', opacity: 0.6, color: 'white' }}>Progress: {quest.progress} / {quest.target}</div>
                <div style={{ height: '6px', width: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '6px' }}>
                   <div style={{ height: '100%', width: `${Math.min(100, (quest.progress / quest.target) * 100)}%`, background: '#00d2ff', borderRadius: '3px' }} />
                </div>
              </div>
              
              {quest.completed && !quest.claimed ? (
                <button onClick={() => onClaim(quest.id)} style={{ background: '#00d2ff', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: 900, fontSize: '12px' }}>Claim</button>
              ) : quest.claimed ? (
                <div style={{ color: '#00d2ff', fontWeight: 900, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14} /> Done</div>
              ) : (
                <div style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 900, fontSize: '12px' }}>+{quest.reward} 🪙</div>
              )}
            </div>
          ))}
          {(!quests || quests.length === 0) && <div style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>No quests today. Come back tomorrow!</div>}
        </div>
      </motion.div>
    </div>
  );
};

export default QuestsModal;