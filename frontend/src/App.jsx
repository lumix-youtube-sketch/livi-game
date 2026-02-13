import React, { useEffect, useState, Suspense } from 'react';
import WebApp from '@twa-dev/sdk';
import { login, createPet, joinPet } from './api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight, User as UserIcon, Loader2 } from 'lucide-react';
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
  const [creationStep, setCreationStep] = useState(false);
  const [newName, setNewName] = useState('Livi');

  useEffect(() => {
    try { WebApp.ready(); WebApp.expand(); } catch(e) {}
    const init = async () => {
      try {
        const res = await login();
        if (res?.data) {
            setUser(res.data.user);
            setPets(res.data.pets || []);
            const startParam = WebApp.initDataUnsafe?.start_param;
            if (startParam?.startsWith('join_')) {
                const petId = startParam.replace('join_', '');
                const joinRes = await joinPet(petId);
                if (joinRes?.data?.pet) {
                    setCurrentPet(joinRes.data.pet);
                    setView('game');
                }
            }
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    init();
  }, []);

  const handleCreatePet = async () => {
    try {
      const res = await createPet(null, newName, 'capsule');
      if (res.data?.pet) {
          setPets(p => [...p, res.data.pet]);
          setCurrentPet(res.data.pet);
          setCreationStep(false);
          setView('game');
      }
    } catch (err) { alert('Error'); }
  };

  const getCardStyle = (idx) => {
      const isCenter = idx === activeIdx;
      const dist = Math.abs(idx - activeIdx);
      // Simple visibility logic for carousel
      if (dist > 1) return { display: 'none' };
      
      return {
          zIndex: isCenter ? 10 : 5,
          scale: isCenter ? 1 : 0.85,
          opacity: isCenter ? 1 : 0.5,
          filter: isCenter ? 'none' : 'blur(2px)',
          x: (idx - activeIdx) * 220, // spacing
          position: 'absolute'
      };
  };

  return (
    <div className="app-container" style={{ background: '#050508', minHeight: '100vh', color: 'white', overflow: 'hidden' }}>
      {loading && (
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 className="animate-spin" />
          </div>
      )}

      {!loading && (
        <main style={{ width: '100%', height: '100vh', position: 'relative' }}>
          
          {/* LOBBY CAROUSEL */}
          {view === 'lobby' && !creationStep && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>LOBBY</h2>
                <div className="hud-capsule" style={{ padding: '4px 8px' }}><UserIcon size={14} /></div>
              </header>

              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {pets.map((pet, idx) => (
                  <motion.div
                    key={pet._id}
                    animate={getCardStyle(idx)}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    onClick={() => {
                        if (idx === activeIdx) { setCurrentPet(pet); setView('game'); }
                        else setActiveIdx(idx);
                    }}
                    style={{ 
                        width: '240px', height: '380px', 
                        background: 'rgba(255,255,255,0.03)', 
                        borderRadius: '30px', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden',
                        cursor: 'pointer'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                        <ModelViewer type="pet" color={pet.skinColor} accessories={pet.accessories} isLobby={true} />
                    </div>
                    <div style={{ padding: '15px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                        <h3 style={{ margin: 0, fontSize: '20px' }}>{pet.name}</h3>
                        <div style={{ fontSize: '10px', opacity: 0.6 }}>LVL {pet.level}</div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Add New Card (Always at the end) */}
                <motion.div
                    animate={getCardStyle(pets.length)}
                    onClick={() => {
                        if (pets.length === activeIdx) setCreationStep(true);
                        else setActiveIdx(pets.length);
                    }}
                    style={{ width: '240px', height: '380px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                    <Plus size={30} opacity={0.3} />
                </motion.div>
              </div>
              
              <div style={{ height: '50px', textAlign: 'center', opacity: 0.4, fontSize: '10px' }}>
                  SWIPE OR TAP TO SELECT
              </div>
            </div>
          )}

          {/* CREATION */}
          {creationStep && (
            <div style={{ padding: '30px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>NEW FRIEND</h2>
              <input value={newName} onChange={e => setNewName(e.target.value)} style={{ padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', marginBottom: '20px' }} />
              <button onClick={handleCreatePet} style={{ padding: '15px', borderRadius: '12px', background: 'white', color: 'black', fontWeight: 'bold' }}>CREATE</button>
              <button onClick={() => setCreationStep(false)} style={{ marginTop: '15px', background: 'transparent', color: 'white', opacity: 0.5 }}>CANCEL</button>
            </div>
          )}

          {/* GAME VIEW */}
          {view === 'game' && currentPet && (
            <div style={{ height: '100vh', position: 'relative' }}>
               <button onClick={() => setView('lobby')} style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, background: 'rgba(0,0,0,0.3)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: 'white' }}>
                 <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
               </button>
               <Suspense fallback={<div className="loader-center"><Loader2 className="animate-spin" /></div>}>
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