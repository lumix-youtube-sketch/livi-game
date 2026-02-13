import React, { useEffect, useState, Suspense } from 'react';
import WebApp from '@twa-dev/sdk';
import { login, createPet, joinPet } from './api';
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
  const [newName, setNewName] = useState('Livi');

  useEffect(() => {
    try { 
        WebApp.ready(); 
        WebApp.expand();
        WebApp.setHeaderColor('#fdfcf0'); 
        WebApp.setBackgroundColor('#fdfcf0');
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
      if (Math.abs(dist) > 1) return { display: 'none' };
      return {
          zIndex: dist === 0 ? 10 : 5,
          scale: dist === 0 ? 1 : 0.8,
          opacity: dist === 0 ? 1 : 0.4,
          filter: dist === 0 ? 'none' : 'blur(4px) grayscale(50%)',
          x: dist * 240,
          rotateY: dist * -20,
          position: 'absolute'
      };
  };

  return (
    <div className="app-container" style={{ background: '#fdfcf0', minHeight: '100vh', color: '#2d3436', overflow: 'hidden' }}>
      <AnimatePresence>
        {loading && (
            <motion.div exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#fdfcf0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" color="#6c5ce7" />
            </motion.div>
        )}
      </AnimatePresence>

      {!loading && (
        <main style={{ width: '100%', height: '100vh', position: 'relative' }}>
          
          {view === 'lobby' && !creationStep && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <header style={{ padding: '30px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#2d3436' }}>Home</h2>
                    <div style={{ fontSize: '12px', opacity: 0.5, fontWeight: 700 }}>SELECT COMPANION</div>
                </div>
                <div className="hud-capsule" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <UserIcon size={16} color="#6c5ce7" />
                </div>
              </header>

              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1000px' }}>
                {pets.map((pet, idx) => (
                  <motion.div
                    key={pet._id}
                    animate={getCardStyle(idx)}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    onClick={() => idx === activeIdx ? handleStart(pet) : handleSelect(idx)}
                    className="carousel-card"
                  >
                    <div style={{ flex: 1, position: 'relative' }}>
                        <ModelViewer type="pet" color={pet.skinColor} accessories={pet.accessories} isLobby={true} />
                    </div>
                    <div style={{ padding: '20px', textAlign: 'center', background: 'white' }}>
                        <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 900 }}>{pet.name}</h3>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '8px' }}>
                            <div className="badge"><Clock size={10} /> {getAgeString(pet.createdAt)}</div>
                            <div className="badge">LVL {pet.level}</div>
                        </div>
                    </div>
                  </motion.div>
                ))}
                
                <motion.div
                    animate={getCardStyle(pets.length)}
                    onClick={() => pets.length === activeIdx ? setCreationStep(true) : handleSelect(pets.length)}
                    style={{ width: '260px', height: '420px', border: '2px dashed rgba(0,0,0,0.1)', borderRadius: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.02)' }}
                >
                    <Plus size={40} opacity={0.2} />
                    <span style={{ fontSize: '12px', fontWeight: 800, opacity: 0.2, marginTop: '10px' }}>NEW FRIEND</span>
                </motion.div>
              </div>
              
              <div style={{ padding: '40px', textAlign: 'center' }}>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStart(pets[activeIdx])}
                    style={{ width: '100%', maxWidth: '200px', padding: '18px', borderRadius: '20px', background: '#6c5ce7', color: 'white', fontWeight: 900, border: 'none', boxShadow: '0 10px 25px rgba(108, 92, 231, 0.3)' }}
                  >
                      START JOURNEY
                  </motion.button>
              </div>
            </div>
          )}

          {view === 'game' && currentPet && (
            <div style={{ height: '100vh', position: 'relative' }}>
               <button onClick={() => { setView('lobby'); triggerHaptic(); }} style={{ position: 'absolute', top: '25px', left: '25px', zIndex: 100, background: 'white', width: '40px', height: '40px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                 <ArrowRight size={18} color="#2d3436" style={{ transform: 'rotate(180deg)' }} />
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