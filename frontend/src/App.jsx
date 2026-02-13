import React, { useEffect, useState, Suspense } from 'react';
import WebApp from '@twa-dev/sdk';
import { login, createPet, joinPet } from './api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight, User as UserIcon, Loader2 } from 'lucide-react';
import ModelViewer from './components/ModelViewer';
import './App.css';

const Pet = React.lazy(() => import('./components/Pet'));
const Actions = React.lazy(() => import('./components/Actions'));

const getPetAge = (createdAt) => {
    const start = new Date(createdAt);
    const now = new Date();
    const diff = now - start;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d`;
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return `${hours}h`;
};

const SplashScreen = () => (
  <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
      <div style={{ width: '220px', height: '220px' }}>
         <ModelViewer type="pet" color="#4834d4" shape="capsule" isLobby={true} style={{ height: '100%' }} />
      </div>
      <motion.h1 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginTop: 20, fontFamily: 'Nunito', fontWeight: 900, fontSize: 44, color: 'white', letterSpacing: '-2px' }}>LIVI</motion.h1>
      <div className="loader-ring" style={{ marginTop: 20 }}></div>
  </motion.div>
);

function App() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [currentPet, setCurrentPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('loading'); 
  const [creationStep, setCreationStep] = useState(false);
  const [newName, setNewName] = useState('Livi');
  const [newShape, setNewShape] = useState('capsule');

  useEffect(() => {
    WebApp.ready(); WebApp.expand();
    const init = async () => {
      try {
        const res = await login();
        setUser(res.data.user);
        const userPets = res.data.pets || [];
        setPets(userPets);
        
        const startParam = WebApp.initDataUnsafe?.start_param;
        if (startParam && startParam.startsWith('join_')) {
            const petId = startParam.replace('join_', '');
            const joinRes = await joinPet(petId);
            setCurrentPet(joinRes.data.pet);
            setView('game');
        } else {
            setView('lobby');
        }
      } catch (err) {
        console.error('Init Error:', err);
        setView('lobby'); 
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleCreatePet = async () => {
    try {
      const res = await createPet(null, newName, newShape);
      setPets(prev => [...prev, res.data.pet]);
      setCurrentPet(res.data.pet);
      setCreationStep(false);
      setView('game');
    } catch (err) { alert('Error creating pet'); }
  };

  return (
    <div className="app-container" style={{ background: '#0a0a0f', minHeight: '100vh', color: 'white' }}>
      <AnimatePresence mode="wait">
        {loading && <SplashScreen key="splash" />}
      </AnimatePresence>

      {!loading && (
        <main style={{ width: '100%', height: '100vh' }}>
          {view === 'lobby' && !creationStep && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="nebula-bg" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <header style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>{user?.firstName?.toUpperCase() || 'PLAYER'}</h1>
                <div className="hud-capsule" style={{ background: 'rgba(255,255,255,0.05)' }}><UserIcon size={18} /></div>
              </header>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflowX: 'auto', padding: '0 20px', gap: '20px', scrollSnapType: 'x mandatory' }} className="hide-scroll">
                {pets.map(pet => (
                  <motion.div 
                    key={pet._id} 
                    style={{ scrollSnapAlign: 'center', minWidth: '280px', height: '460px', borderRadius: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}
                    onClick={() => { setCurrentPet(pet); setView('game'); }}
                  >
                    <div style={{ height: '70%' }}>
                      <ModelViewer type="pet" color={pet.skinColor} shape={pet.shape} accessories={pet.accessories} isLobby={true} style={{ height: '100%' }} />
                    </div>
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 900 }}>{pet.name}</h2>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                        <div className="hud-capsule" style={{ fontSize: '10px' }}>LVL {pet.level}</div>
                        <div className="hud-capsule" style={{ fontSize: '10px' }}>{getPetAge(pet.createdAt)}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <div style={{ scrollSnapAlign: 'center', minWidth: '280px', height: '460px', borderRadius: '40px', border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCreationStep(true)}>
                  <Plus size={40} style={{ opacity: 0.3 }} />
                  <span style={{ marginTop: '10px', fontWeight: 800, opacity: 0.3 }}>NEW ENTRY</span>
                </div>
              </div>
            </motion.div>
          )}

          {creationStep && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: '40px', fontWeight: 900, marginBottom: '40px' }}>NEW<br/>ENTITY</h2>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="NAME" style={{ width: '100%', padding: '20px', borderRadius: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '18px', marginBottom: '20px' }} />
              <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
                {['capsule', 'round', 'boxy'].map(s => (
                  <button key={s} onClick={() => setNewShape(s)} style={{ flex: 1, padding: '15px', borderRadius: '10px', background: newShape === s ? 'white' : 'transparent', color: newShape === s ? 'black' : 'white', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 800 }}>{s.toUpperCase()}</button>
                ))}
              </div>
              <button onClick={handleCreatePet} style={{ width: '100%', padding: '20px', borderRadius: '15px', background: 'white', color: 'black', fontWeight: 900, fontSize: '18px' }}>INITIALIZE</button>
              <button onClick={() => setCreationStep(false)} style={{ marginTop: '20px', opacity: 0.5 }}>CANCEL</button>
            </motion.div>
          )}

          {view === 'game' && currentPet && (
            <div style={{ height: '100vh', position: 'relative' }}>
               <button onClick={() => setView('lobby')} style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 1000, background: 'rgba(255,255,255,0.05)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
               </button>
               <Suspense fallback={<div className="loader-center"><Loader2 className="animate-spin" size={40} /></div>}>
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