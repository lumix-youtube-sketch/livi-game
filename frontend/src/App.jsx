import React, { useEffect, useState, Suspense } from 'react';
import WebApp from '@twa-dev/sdk';
import { login, createPet } from './api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trophy, Sparkles } from 'lucide-react';
import ModelViewer from './components/ModelViewer'; // Added missing import

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
        setPets(res.data.pets || []);
        setView('lobby'); // Switch to lobby after data is loaded
      } catch (err) {
        console.error('Login failed', err);
        setView('lobby'); // Still show lobby (to allow retry/new pet)
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

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
              style={{ height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)' }}
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
                style={{ background: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: '15px', fontWeight: 'bold', fontSize: '14px' }}
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
                style={{ height: '180px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', opacity: 0.7, textTransform: 'uppercase', fontWeight: 800 }}>Lvl {pet.level}</span>
                  {pet.users && pet.users.length > 1 && <Users size={14} color="var(--secondary)" />}
                </div>
                <div style={{ height: '80px' }}>
                   <Suspense fallback={null}>
                      <ModelViewer type="pet" mood="happy" color={pet.skinColor} accessories={pet.accessories} style={{ height: '100%' }} />
                   </Suspense>
                </div>
                <div style={{ fontWeight: 800, textAlign: 'center' }}>{pet.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* GAME VIEW */}
      {view === 'game' && currentPet && (
        <Suspense fallback={<div className="loader" style={{ position: 'absolute', top: '50%', left: '50%' }} />}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <button 
                onClick={() => setView('lobby')}
                style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '10px', borderRadius: '15px', fontSize: '12px', fontWeight: 800 }}
             >
               Back
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