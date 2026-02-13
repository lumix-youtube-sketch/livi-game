import React, { useEffect, useState, Suspense } from 'react';
import WebApp from '@twa-dev/sdk';
import { login, createPet, joinPet } from './api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight, User as UserIcon, Loader2, RefreshCw } from 'lucide-react';
import ModelViewer from './components/ModelViewer';
import './App.css';

const Pet = React.lazy(() => import('./components/Pet'));
const Actions = React.lazy(() => import('./components/Actions'));

const SplashScreen = () => (
  <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050508' }}>
      <div style={{ width: '250px', height: '250px' }}>
         <ModelViewer type="pet" color="#4834d4" shape="capsule" isLobby={true} style={{ height: '100%' }} />
      </div>
      <motion.h1 animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} style={{ marginTop: 20, fontFamily: 'Nunito', fontWeight: 900, fontSize: 48, color: 'white', letterSpacing: '-2px' }}>LIVI</motion.h1>
      <div className="loader-ring" style={{ marginTop: 20 }}></div>
  </motion.div>
);

function App() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [currentPet, setCurrentPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('lobby'); // По умолчанию ставим lobby, чтобы избежать пустоты
  const [creationStep, setCreationStep] = useState(false);
  const [newName, setNewName] = useState('Livi');
  const [newShape, setNewShape] = useState('capsule');

  useEffect(() => {
    WebApp.ready(); WebApp.expand();
    
    const init = async () => {
      try {
        const res = await login();
        if (res.data) {
            setUser(res.data.user);
            setPets(res.data.pets || []);
            
            const startParam = WebApp.initDataUnsafe?.start_param;
            if (startParam && startParam.startsWith('join_')) {
                const petId = startParam.replace('join_', '');
                const joinRes = await joinPet(petId);
                setCurrentPet(joinRes.data.pet);
                setView('game');
            }
        }
      } catch (err) {
        console.error('Init Error:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
    // Страховочный таймер: если через 7 секунд все еще загрузка - убираем ее
    const timer = setTimeout(() => setLoading(false), 7000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app-container" style={{ background: '#050508', minHeight: '100vh', color: 'white', overflow: 'hidden' }}>
      <AnimatePresence>
        {loading && <SplashScreen key="splash" />}
      </AnimatePresence>

      {!loading && (
        <main style={{ width: '100%', height: '100vh', position: 'relative' }}>
          {view === 'lobby' && !creationStep && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="nebula-bg" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <header style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '-1px' }}>{user?.firstName?.toUpperCase() || 'PLAYER'}</h1>
                <div className="hud-capsule" style={{ background: 'rgba(255,255,255,0.05)', border: 'none' }}><UserIcon size={18} /></div>
              </header>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflowX: 'auto', padding: '0 40px', gap: '30px', scrollSnapType: 'x mandatory' }} className="hide-scroll">
                {pets.map(pet => (
                  <motion.div 
                    key={pet._id} 
                    whileTap={{ scale: 0.98 }}
                    style={{ scrollSnapAlign: 'center', minWidth: '300px', height: '480px', borderRadius: '50px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                    onClick={() => { setCurrentPet(pet); setView('game'); }}
                  >
                    <div style={{ height: '75%' }}>
                      <ModelViewer type="pet" color={pet.skinColor} shape={pet.shape} accessories={pet.accessories} isLobby={true} style={{ height: '100%' }} />
                    </div>
                    <div style={{ padding: '20px', textAlign: 'center', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}>
                      <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }}>{pet.name}</h2>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                        <div className="hud-capsule" style={{ fontSize: '11px', opacity: 0.6 }}>LEVEL {pet.level}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <div style={{ scrollSnapAlign: 'center', minWidth: '300px', height: '480px', borderRadius: '50px', border: '2px dashed rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)' }} onClick={() => setCreationStep(true)}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '30px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={32} style={{ opacity: 0.2 }} />
                  </div>
                  <span style={{ marginTop: '20px', fontWeight: 800, opacity: 0.2, letterSpacing: '2px' }}>NEW ENTRY</span>
                </div>
              </div>
            </motion.div>
          )}

          {creationStep && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '40px', letterSpacing: '-2px' }}>NEW<br/>ENTITY</h2>
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '30px', marginBottom: '20px' }}>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="DESIGNATION" style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '24px', fontWeight: 900, outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
                {['capsule', 'round', 'boxy'].map(s => (
                  <button key={s} onClick={() => setNewShape(s)} style={{ flex: 1, padding: '20px', borderRadius: '20px', background: newShape === s ? 'white' : 'rgba(255,255,255,0.05)', color: newShape === s ? 'black' : 'white', fontWeight: 900, transition: '0.3s' }}>{s.toUpperCase()}</button>
                ))}
              </div>
              <button onClick={handleCreatePet} style={{ width: '100%', padding: '24px', borderRadius: '25px', background: 'white', color: 'black', fontWeight: 900, fontSize: '20px', boxShadow: '0 10px 30px rgba(255,255,255,0.2)' }}>INITIALIZE</button>
              <button onClick={() => setCreationStep(false)} style={{ marginTop: '30px', opacity: 0.3, fontWeight: 800 }}>CANCEL</button>
            </motion.div>
          )}

          {view === 'game' && currentPet && (
            <div style={{ height: '100vh', position: 'relative' }}>
               <button onClick={() => setView('lobby')} style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 1000, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', width: '45px', height: '45px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
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