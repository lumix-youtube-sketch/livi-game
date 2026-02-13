import React, { useEffect, useState, Suspense } from 'react';
import WebApp from '@twa-dev/sdk';
import { login, createPet } from './api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, User as UserIcon, Loader2, ArrowRight, Clock, Sparkles } from 'lucide-react';
import ModelViewer from './components/ModelViewer';
import './App.css';

const Pet = React.lazy(() => import('./components/Pet'));
const Actions = React.lazy(() => import('./components/Actions'));

function App() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [currentPet, setCurrentPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('lobby'); 
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeAction, setActiveAction] = useState(null);

  useEffect(() => {
    try { WebApp.ready(); WebApp.expand(); } catch(e) {}
    const init = async () => {
      try {
        const res = await login();
        if (res?.data) {
            setUser(res.data.user);
            setPets(res.data.pets || []);
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    init();
  }, []);

  const triggerHaptic = (type = 'light') => {
      try { WebApp.HapticFeedback.impactOccurred(type); } catch(e) {}
  };

  const handleSelect = (idx) => {
      if (idx === activeIdx) return;
      setActiveIdx(idx);
      triggerHaptic('medium');
  };

  const handleStart = (pet) => {
      triggerHaptic('heavy');
      setCurrentPet(pet);
      setView('game');
  };

  const getCardStyle = (idx) => {
      const dist = idx - activeIdx;
      if (Math.abs(dist) > 1) return { opacity: 0, scale: 0.5, pointerEvents: 'none' };
      return {
          zIndex: dist === 0 ? 10 : 5,
          scale: dist === 0 ? 1 : 0.7,
          opacity: dist === 0 ? 1 : 0.2,
          x: dist * 240,
          rotateY: dist * -20,
          position: 'absolute'
      };
  };

  return (
    <div className="app-container" style={{ background: '#050508', minHeight: '100vh', color: 'white', overflow: 'hidden' }}>
      {/* GLOBAL NEBULA BACKGROUND */}
      <div className="nebula-bg" style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.6 }} />

      {loading && (
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
              <Loader2 className="animate-spin" color="#6c5ce7" size={48} />
              <h1 style={{ marginTop: '20px', letterSpacing: '4px', fontSize: '14px', opacity: 0.5 }}>SYNCHRONIZING...</h1>
          </div>
      )}

      {!loading && (
        <main style={{ width: '100%', height: '100vh', position: 'relative', zIndex: 1 }}>
          
          {view === 'lobby' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <header style={{ padding: '30px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 900, letterSpacing: '-1px' }}>Livi</h2>
                    <div style={{ fontSize: '10px', opacity: 0.5, fontWeight: 800, letterSpacing: '1px' }}>SELECT YOUR ENTITY</div>
                </div>
                <div className="hud-capsule" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <UserIcon size={16} color="#a29bfe" />
                </div>
              </header>

              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1200px' }}>
                {pets.map((pet, idx) => (
                  <motion.div
                    key={pet._id}
                    animate={getCardStyle(idx)}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    onClick={() => idx === activeIdx ? handleStart(pet) : handleSelect(idx)}
                    className="carousel-card"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <div style={{ flex: 1 }}>
                        <ModelViewer type="pet" color={pet.skinColor} accessories={pet.accessories} isLobby={true} />
                    </div>
                    <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(0,0,0,0.4)' }}>
                        <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>{pet.name}</h3>
                        <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '5px' }}>LEVEL {pet.level}</div>
                    </div>
                  </motion.div>
                ))}
                
                <motion.div
                    animate={getCardStyle(pets.length)}
                    onClick={() => setActiveIdx(pets.length)}
                    style={{ width: '240px', height: '400px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
                >
                    <Plus size={40} opacity={0.2} />
                    <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.2, marginTop: '15px' }}>NEW_ENTRY</span>
                </motion.div>
              </div>
              
              <div style={{ padding: '40px', textAlign: 'center' }}>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStart(pets[activeIdx])}
                    className="start-btn"
                    style={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', color: 'white', border: 'none' }}
                  >
                      INITIALIZE
                  </motion.button>
              </div>
            </div>
          )}

          {view === 'game' && currentPet && (
            <div style={{ height: '100vh', position: 'relative' }}>
               <button onClick={() => { setView('lobby'); triggerHaptic(); }} style={{ position: 'absolute', top: '25px', left: '25px', zIndex: 100, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                 <ArrowRight size={18} color="white" style={{ transform: 'rotate(180deg)' }} />
               </button>
               <Suspense fallback={null}>
                  <Pet pet={currentPet} onUpdate={setCurrentPet} activeAction={activeAction} />
                  <Actions pet={currentPet} onUpdate={setCurrentPet} onActionTrigger={setActiveAction} />
               </Suspense>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default App;