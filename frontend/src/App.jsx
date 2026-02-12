import React, { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { login, joinPair, createSoloPet } from './api';
import Pet from './components/Pet';
import Actions from './components/Actions';
import ModelViewer from './components/ModelViewer';
import { motion } from 'framer-motion';
import { Users, UserPlus, Sparkles, Trophy } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pairIdInput, setPairIdInput] = useState('');
  const [activeAction, setActiveAction] = useState(null); // 'feed', 'play', etc.

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    WebApp.setHeaderColor('#f5f7fa'); 

    const initAuth = async () => {
      try {
        const res = await login();
        setUser(res.data.user);
        setPet(res.data.pet);
      } catch (err) {
        console.error('Login failed', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleJoin = async () => {
    if (!pairIdInput) return;
    try {
      const res = await joinPair(pairIdInput);
      setPet(res.data.pet);
      const userRes = await login(); 
      setUser(userRes.data.user);
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleCreateSolo = async () => {
    try {
      const res = await createSoloPet();
      setPet(res.data.pet);
      const userRes = await login();
      setUser(userRes.data.user);
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const triggerActionAnimation = (type) => {
    setActiveAction(type);
    // Reset after animation duration
    setTimeout(() => setActiveAction(null), 2000);
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-gradient)' }}>
      <motion.div 
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Sparkles size={60} color="#6c5ce7" />
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '120px', maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
      {/* Background Decor */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />

      {/* Header */}
      <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', background: 'linear-gradient(45deg, #6c5ce7, #fd79a8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Livi
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00b894' }} />
             <small style={{ opacity: 0.6, fontWeight: 500 }}>{user?.firstName}</small>
          </div>
        </motion.div>
        {user?.telegramId && (
          <motion.div 
            initial={{ x: 20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            className="glass-panel" 
            style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}
          >
            #{user.telegramId}
          </motion.div>
        )}
      </header>

      {!pet ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          style={{ padding: '20px' }}
        >
          <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', marginBottom: '30px', border: '2px solid rgba(255,255,255,0.3)' }}>
            <div style={{ height: '250px', marginBottom: '20px' }}>
                <ModelViewer type="egg" />
            </div>
            <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Begin Your Story</h2>
            <p style={{ opacity: 0.7, lineHeight: '1.6', marginBottom: '30px' }}>Your digital companion is waiting to hatch. Choose your path and start growing together.</p>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateSolo} 
              style={{ 
                width: '100%', padding: '18px',
                background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)', 
                color: 'white', borderRadius: '20px', fontWeight: 'bold', fontSize: '18px',
                boxShadow: '0 10px 20px rgba(108, 92, 231, 0.3)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              Hatch Solo
            </motion.button>
          </div>

          <div style={{ position: 'relative', textAlign: 'center', margin: '30px 0' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.1)', zIndex: 0 }} />
            <span style={{ position: 'relative', background: 'var(--bg-gradient)', padding: '0 15px', fontSize: '14px', fontWeight: 600, opacity: 0.5, zIndex: 1 }}>COOPERATIVE PLAY</span>
          </div>

          <div className="glass-panel" style={{ padding: '25px' }}>
            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
              <Users size={20} className="text-primary" /> Joint Adoption
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Enter Partner's ID" 
                value={pairIdInput}
                onChange={(e) => setPairIdInput(e.target.value)}
                style={{ 
                  flex: 1, padding: '15px', borderRadius: '15px', 
                  border: '2px solid rgba(0,0,0,0.05)', outline: 'none',
                  background: 'rgba(255,255,255,0.8)', fontSize: '16px'
                }}
              />
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleJoin}
                style={{ 
                  padding: '0 25px', borderRadius: '15px',
                  background: '#2d3436', color: 'white', fontWeight: '600'
                }}
              >
                Join
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Pet pet={pet} activeAction={activeAction} />
          <Actions onUpdate={setPet} onActionTrigger={triggerActionAnimation} />
        </motion.div>
      )}
    </div>
  );
}

export default App;