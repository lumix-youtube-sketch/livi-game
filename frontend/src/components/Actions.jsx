import React, { useState } from 'react';
import { performAction, uploadClothing } from '../api';
import { Utensils, Gamepad2, Moon, Shirt, Upload, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Actions = ({ onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAction = async (type) => {
    try {
      // Haptic feedback if available (mocked for web)
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
      const res = await performAction(type);
      onUpdate(res.data.pet);
      if (res.data.leveledUp) {
        alert("🎉 LEVEL UP!"); // Replace with nice modal later
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
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

  const ActionButton = ({ icon: Icon, label, onClick, color }) => (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
        background: 'none', color: 'var(--text)', padding: '10px'
      }}
    >
      <div style={{ 
        width: '50px', height: '50px', borderRadius: '15px', 
        background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)' 
      }}>
        <Icon color="white" size={24} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 600 }}>{label}</span>
    </motion.button>
  );

  return (
    <>
      {/* Floating Dock */}
      <div className="glass-panel" style={{ 
        position: 'fixed', bottom: '20px', left: '20px', right: '20px', 
        display: 'flex', justifyContent: 'space-around', padding: '15px 10px',
        zIndex: 100
      }}>
        <ActionButton icon={Utensils} label="Feed" color="#ff7675" onClick={() => handleAction('feed')} />
        <ActionButton icon={Gamepad2} label="Play" color="#74b9ff" onClick={() => handleAction('play')} />
        <ActionButton icon={Moon} label="Sleep" color="#a29bfe" onClick={() => handleAction('sleep')} />
        <ActionButton icon={Shirt} label="Style" color="#fd79a8" onClick={() => setShowMenu(true)} />
      </div>

      {/* Customization Modal */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', zIndex: 200,
              display: 'flex', alignItems: 'flex-end'
            }}
            onClick={() => setShowMenu(false)}
          >
            <div 
              className="glass-panel" 
              style={{ width: '100%', borderRadius: '25px 25px 0 0', padding: '30px', background: 'var(--glass)' }}
              onClick={e => e.stopPropagation()}
            >
              <h3>Wardrobe</h3>
              <p style={{ opacity: 0.7, marginBottom: '20px' }}>Upload a PNG image to dress up your pet!</p>
              
              <label style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', 
                background: 'var(--primary)', color: 'white', padding: '15px', 
                borderRadius: '12px', justifyContent: 'center', cursor: 'pointer'
              }}>
                <Upload size={20} />
                {uploading ? 'Sewing...' : 'Upload Outfit'}
                <input type="file" hidden accept="image/png" onChange={handleFileChange} />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Actions;