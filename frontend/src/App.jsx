import React, { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { login, joinPair, createSoloPet } from './api';
import Pet from './components/Pet';
import Actions from './components/Actions';
import { motion } from 'framer-motion';
import { Users, UserPlus, Sparkles } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pairIdInput, setPairIdInput] = useState('');

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    // Set header color
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

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        <Sparkles size={40} color="#6c5ce7" />
      </motion.div>
    </div>
  );

  return (
    <div style={{ paddingBottom: '100px', maxWidth: '500px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', background: '-webkit-linear-gradient(45deg, #6c5ce7, #fd79a8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Livi
          </h1>
          <small style={{ opacity: 0.6 }}>Hi, {user?.firstName}</small>
        </div>
        {user?.telegramId && (
          <div className="glass-panel" style={{ padding: '5px 10px', fontSize: '10px' }}>
            ID: {user.telegramId}
          </div>
        )}
      </header>

      {!pet ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: '20px' }}
        >
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🥚</div>
            <h2>Adopt a Friend</h2>
            <p style={{ opacity: 0.7 }}>Livi needs a home. You can raise it alone or share the responsibility with a friend!</p>
            
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateSolo} 
              style={{ 
                width: '100%', padding: '15px', marginTop: '20px',
                background: 'var(--primary)', color: 'white', 
                borderRadius: '15px', fontWeight: 'bold', fontSize: '16px',
                boxShadow: '0 5px 15px rgba(108, 92, 231, 0.4)'
              }}
            >
              Start Solo Journey
            </motion.button>
          </div>

          <div style={{ textAlign: 'center', opacity: 0.6, margin: '20px 0' }}>— OR —</div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={18} /> Co-op Mode
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Paste Friend's ID" 
                value={pairIdInput}
                onChange={(e) => setPairIdInput(e.target.value)}
                style={{ 
                  flex: 1, padding: '12px', borderRadius: '12px', 
                  border: '1px solid rgba(0,0,0,0.1)', outline: 'none',
                  background: 'rgba(255,255,255,0.5)'
                }}
              />
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleJoin}
                style={{ 
                  padding: '0 20px', borderRadius: '12px',
                  background: 'var(--secondary)', color: 'white'
                }}
              >
                Join
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Pet pet={pet} />
          <Actions onUpdate={setPet} />
        </motion.div>
      )}
    </div>
  );
}

export default App;