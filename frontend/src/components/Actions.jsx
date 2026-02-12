import React, { useState } from 'react';
import { performAction, uploadClothing } from '../api';
import { Utensils, Gamepad2, Moon, Shirt, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const Actions = ({ onUpdate, onActionTrigger }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAction = async (type) => {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
      
      if (onActionTrigger) onActionTrigger(type);

      const res = await performAction(type);
      onUpdate(res.data.pet);
      
      if (res.data.leveledUp) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6c5ce7', '#fd79a8', '#a29bfe']
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const res = await uploadClothing(formData);
      onUpdate(res.data.pet);
      setShowMenu(false);
    } catch (err) { alert('Upload failed'); } 
    finally { setUploading(false); }
  };

  const ActionButton = ({ icon: Icon, label, onClick, color, gradient }) => (
    <motion.button
      whileHover={{ y: -5, scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        background: 'none', color: 'var(--text)', padding: '0',
        position: 'relative'
      }}
    >
      <div style={{ 
        width: '56px', height: '56px', borderRadius: '18px', 
        background: gradient || color, 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Icon color="white" size={26} strokeWidth={2.5} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: 700, opacity: 0.7, marginTop: '4px' }}>{label}</span>
    </motion.button>
  );

  return (
    <>
      {/* iOS Style Floating Dock */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="glass-panel"
        style={{ 
          position: 'fixed', bottom: '30px', left: '50%', x: '-50%',
          width: '90%', maxWidth: '400px',
          display: 'flex', justifyContent: 'space-evenly', padding: '16px 10px',
          zIndex: 100, borderRadius: '28px', 
          border: '1px solid rgba(255,255,255,0.5)',
          background: 'rgba(255, 255, 255, 0.75)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <ActionButton icon={Utensils} label="Feed" gradient="linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)" onClick={() => handleAction('feed')} />
        <ActionButton icon={Gamepad2} label="Play" gradient="linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)" onClick={() => handleAction('play')} />
        <ActionButton icon={Moon} label="Sleep" gradient="linear-gradient(to top, #c471f5 0%, #fa71cd 100%)" onClick={() => handleAction('sleep')} />
        <ActionButton icon={Shirt} label="Style" gradient="linear-gradient(to right, #4facfe 0%, #00f2fe 100%)" onClick={() => setShowMenu(true)} />
      </motion.div>

      {/* Wardrobe Modal */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', zIndex: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}
            onClick={() => setShowMenu(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel" 
              style={{ width: '100%', maxWidth: '350px', padding: '30px', background: 'white' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>Wardrobe</h3>
                <button onClick={() => setShowMenu(false)} style={{ background: '#f5f7fa', padding: '8px', borderRadius: '50%' }}>
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  <div style={{ width: '80px', height: '80px', background: '#f0f2f5', borderRadius: '20px', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shirt size={40} color="#cbd5e0" />
                  </div>
                  <p style={{ opacity: 0.6, fontSize: '14px', margin: 0 }}>Upload a .png image with transparency to dress your pet.</p>
              </div>
              
              <label style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', 
                background: 'var(--text)', color: 'white', padding: '16px', 
                borderRadius: '16px', justifyContent: 'center', cursor: 'pointer',
                fontWeight: '700', fontSize: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
              }}>
                <Upload size={20} />
                {uploading ? 'Sewing...' : 'Upload Outfit'}
                <input type="file" hidden accept="image/png" onChange={handleFileChange} />
              </label>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Actions;