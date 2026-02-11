import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Heart, Zap, Coffee, Star } from 'lucide-react';

const Pet = ({ pet }) => {
  const controls = useAnimation();

  useEffect(() => {
    // Breathing animation
    controls.start({
      y: [0, -10, 0],
      scale: [1, 1.02, 1],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    });
  }, [controls]);

  if (!pet) return null;

  // Dynamic face based on mood
  const getFace = () => {
    if (pet.mood < 30) return '😣'; // Sad
    if (pet.hunger < 30) return '😵'; // Hungry
    if (pet.energy < 30) return '😴'; // Sleepy
    return '😺'; // Happy
  };

  const StatBar = ({ icon: Icon, value, color, max = 100 }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <Icon size={16} color={color} />
      <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          style={{ height: '100%', background: color }}
        />
      </div>
    </div>
  );

  return (
    <div className="glass-panel" style={{ padding: '20px', margin: '20px', textAlign: 'center', position: 'relative' }}>
      {/* HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '0.9em', opacity: 0.8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Star size={16} fill="#ffd700" color="#ffd700" />
          <span>Lvl {pet.level}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#ffd700', border: '1px solid #d4af37' }} />
          <span>{pet.coins} 🪙</span>
        </div>
      </div>

      {/* The Pet */}
      <motion.div 
        animate={controls}
        whileTap={{ scale: 0.9 }}
        style={{ 
          width: '220px', 
          height: '220px', 
          margin: '0 auto 30px', 
          background: pet.skinColor || '#FFD700', 
          borderRadius: '40% 40% 45% 45%', // Blob shape
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '80px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}
      >
        {/* Face */}
        <div style={{ zIndex: 2 }}>{getFace()}</div>

        {/* Clothing Layer */}
        {pet.clothingUrl && (
          <img 
            src={`https://livi-backend.onrender.com${pet.clothingUrl}`} 
            style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              width: '120%', 
              height: '120%', 
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 3
            }}
          />
        )}
      </motion.div>

      {/* Stats */}
      <div style={{ padding: '0 10px' }}>
        <StatBar icon={Coffee} value={pet.hunger} color="#ff7675" />
        <StatBar icon={Zap} value={pet.energy} color="#ffeaa7" />
        <StatBar icon={Heart} value={pet.mood} color="#fd79a8" />
      </div>
    </div>
  );
};

export default Pet;