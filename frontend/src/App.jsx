import React, { useEffect, useState, Suspense } from 'react';
import WebApp from '@twa-dev/sdk';
import { login, createPet, joinPet } from './api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trophy, Sparkles, Share2 } from 'lucide-react';
import ModelViewer from './components/ModelViewer';

// Lazy Load Heavy Components
const Pet = React.lazy(() => import('./components/Pet'));
const Actions = React.lazy(() => import('./components/Actions'));

function App() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [currentPet, setCurrentPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('loading'); 
  const [partnerInput, setPartnerInput] = useState('');
  const [activeAction, setActiveAction] = useState(null);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    WebApp.setHeaderColor('#0f0f14'); 
    WebApp.setBackgroundColor('#0f0f14');

    const initAuth = async () => {
      try {
        const res = await login();
        setUser(res.data.user);
        
        // Handle Referral Link
        const startParam = WebApp.initDataUnsafe?.start_param;
        if (startParam && startParam.startsWith('join_')) {
            const petId = startParam.replace('join_', '');
            try {
                const joinRes = await joinPet(petId);
                setCurrentPet(joinRes.data.pet);
                setView('game');
                return;
            } catch (e) { console.error('Join error', e); }
        }

        setPets(res.data.pets || []);
        setView('lobby');
      } catch (err) {
        console.error('Login failed', err);
        setView('lobby');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleInvite = (e, petId) => {
    e.stopPropagation();
    const botUsername = 'livi_game_bot'; 
    const link = `https://t.me/${botUsername}/app?startapp=join_${petId}`;
    WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Adopt this pet with me! 🐾")}`);
  };

  const handleActionTrigger = (type) => {
    setActiveAction(type);
    setTimeout(() => setActiveAction(null), 2000);
  };

  const handleCreatePet = async (isSolo) => {
    try {
      const partnerId = isSolo ? null : partnerInput;
      const res = await createPet(partnerId);
      setPets([...pets, res.data.pet]);
      setCurrentPet(res.data.pet);
      setView('game');
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const selectPet = (pet) => {
    setCurrentPet(pet);
    setView('game');
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-gradient)' }}>
      <span className="loader"></span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', maxWidth: '500px', margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
      
      {/* LOBBY VIEW */}
      {view === 'lobby' && (
        <div style={{ padding: '30px 20px' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', letterSpacing: '-1px' }}>My Pets</h1>
              <p style={{ margin: 0, opacity: 0.5 }}>Select a companion</p>
            </div>
            <div className="hud-capsule">
              <span style={{ fontSize: '14px', fontWeight: 800 }}>{pets.length}/10</span>
            </div>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {/* New Pet Card */}
            <motion.div 
              whileTap={{ scale: 0.95 }}
              className="glass-panel"
              style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)' }}
            >
              <div style={{ marginBottom: '15px' }}>
                 <input 
                   placeholder="Friend ID" 
                   value={partnerInput}
                   onChange={e => setPartnerInput(e.target.value)}
                   style={{ background: 'transparent', border: 'none', color: 'white', textAlign: 'center', width: '100%', outline: 'none', fontSize: '12px' }}
                 />
              </div>
              <button 
                onClick={() => handleCreatePet(!partnerInput)}
                style={{ background: 'var(--primary)', color: 'white', padding: '12px 25px', borderRadius: '15px', fontWeight: 'bold', fontSize: '14px' }}
              >
                <Plus size={16} /> {partnerInput ? 'Co-op' : 'Solo'}
              </button>
            </motion.div>

            {/* Existing Pets */}
            {pets.map(pet => (
              <motion.div 
                key={pet._id}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectPet(pet)}
                className="glass-panel"
                style={{ height: '220px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', opacity: 0.7, fontWeight: 900 }}>LVL {pet.level}</span>
                  <button onClick={(e) => handleInvite(e, pet._id)} style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '10px' }}>
                    <Share2 size={14} color="white" />
                  </button>
                </div>
                <div style={{ height: '100px' }}>
                   <ModelViewer type="pet" mood="happy" color={pet.skinColor} accessories={pet.accessories} style={{ height: '100%' }} />
                </div>
                <div style={{ fontWeight: 900, textAlign: 'center', fontSize: '16px' }}>{pet.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* GAME VIEW */}
      {view === 'game' && currentPet && (
        <Suspense fallback={<div className="loader" style={{ position: 'absolute', top: '50%', left: '50%' }} />}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             <button 
                onClick={() => setView('lobby')}
                style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white', padding: '10px 20px', borderRadius: '15px', fontSize: '12px', fontWeight: 900, border: '1px solid rgba(255,255,255,0.1)' }}
             >
               Lobby
             </button>
             <Pet pet={currentPet} activeAction={activeAction} />
             <Actions pet={currentPet} onUpdate={setCurrentPet} onActionTrigger={handleActionTrigger} />
          </motion.div>
        </Suspense>
      )}
    </div>
  );
}

export default App;