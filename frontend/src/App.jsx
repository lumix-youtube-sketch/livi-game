import React, { useEffect, useState, Suspense } from 'react';
import WebApp from '@twa-dev/sdk';
import { login } from './api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, User as UserIcon, Loader2, ArrowRight, Clock } from 'lucide-react';
import ModelViewer from './components/ModelViewer';
import './App.css';

const Pet = React.lazy(() => import('./components/Pet'));
const Actions = React.lazy(() => import('./components/Actions'));

const getAgeString = (date) => {
    const diff = new Date() - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
};

function App() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [currentPet, setCurrentPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('lobby'); 
  const [activeIdx, setActiveIdx] = useState(0);
  const [creationStep, setCreationStep] = useState(false);

  useEffect(() => {
    try { 
        WebApp.ready(); 
        WebApp.expand();
        WebApp.setHeaderColor('#050508'); 
        WebApp.setBackgroundColor('#050508');
    } catch(e) {}
    
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
      if (Math.abs(dist) > 1) return { opacity: 0, pointerEvents: 'none', scale: 0.5 };
      return {
          zIndex: dist === 0 ? 10 : 5,
          scale: dist === 0 ? 1 : 0.75,
          opacity: dist === 0 ? 1 : 0.3,
          filter: dist === 0 ? 'none' : 'blur(4px)',
          x: dist * 220,
          rotateY: dist * -15,
          position: 'absolute'
      };
  };

  return (
    <div className="app-container" style={{ background: '#050508', minHeight: '100vh', color: 'white', overflow: 'hidden' }}>
      <AnimatePresence>
        {loading && (
            <motion.div exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#050508', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" color="#6c5ce7" size={40} />
                <h1 style={{ marginTop: '20px', letterSpacing: '4px', fontSize: '14px' }}>LIVI CORE</h1>
            </motion.div>
        )}
      </AnimatePresence>

      {!loading && (
        <main style={{ width: '100%', height: '100vh', position: 'relative' }}>
          
          {view === 'lobby' && !creationStep && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <header style={{ padding: '30px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900 }}>Terminals</h2>
                    <div style={{ fontSize: '10px', opacity: 0.4, letterSpacing: '1px' }}>{user?.firstName?.toUpperCase()} // ACCESS_GRANTED</div>
                </div>
                <div className="hud-capsule" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
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
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div style={{ flex: 1, position: 'relative' }}>
                        <ModelViewer type="pet" color={pet.skinColor} accessories={pet.accessories} isLobby={true} />
                    </div>
                    <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(0,0,0,0.3)' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', letterSpacing: '-0.5px' }}>{pet.name}</h3>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                            <div className="badge-dark"><Clock size={10} /> {getAgeString(pet.createdAt)}</div>
                            <div className="badge-dark">LVL {pet.level}</div>
                        </div>
                    </div>
                  </motion.div>
                ))}
                
                <motion.div
                    animate={getCardStyle(pets.length)}
                    onClick={() => pets.length === activeIdx ? alert('Add logic') : handleSelect(pets.length)}
                    style={{ width: '240px', height: '400px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
                >
                    <Plus size={32} opacity={0.2} />
                    <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.2, marginTop: '10px', letterSpacing: '1px' }}>NEW_ENTITY</span>
                </motion.div>
              </div>
              
              <div style={{ padding: '40px', textAlign: 'center' }}>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStart(pets[activeIdx])}
                    className="start-btn"
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
                  <Pet pet={currentPet} onUpdate={setCurrentPet} />
                  <Actions pet={currentPet} onUpdate={setCurrentPet} />
               </Suspense>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default App;