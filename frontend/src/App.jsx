import React, { useEffect, useState, Suspense } from 'react';
import WebApp from '@twa-dev/sdk';
import { login, createPet, joinPet } from './api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight, User as UserIcon, Loader2 } from 'lucide-react';
import ModelViewer from './components/ModelViewer';
import './App.css';

const Pet = React.lazy(() => import('./components/Pet'));
const Actions = React.lazy(() => import('./components/Actions'));

const SplashScreen = () => (
  <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050508' }}>
      <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <Suspense fallback={<Loader2 className="animate-spin" size={40} color="white" />}>
            <ModelViewer type="pet" color="#4834d4" shape="capsule" isLobby={true} style={{ height: '100%' }} />
         </Suspense>
      </div>
      <motion.h1 animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ marginTop: 20, fontFamily: 'Nunito', fontWeight: 900, fontSize: 44, color: 'white' }}>LIVI</motion.h1>
  </motion.div>
);

function App() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [currentPet, setCurrentPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('lobby'); 
  const [creationStep, setCreationStep] = useState(false);
  const [newName, setNewName] = useState('Livi');
  const [newShape, setNewShape] = useState('capsule');

  useEffect(() => {
    try {
        WebApp.ready(); WebApp.expand();
        WebApp.setHeaderColor('#050508'); WebApp.setBackgroundColor('#050508');
    } catch(e) {}

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
      } catch (err) {
        console.error('Init Error:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
    const safety = setTimeout(() => setLoading(false), 6000);
    return () => clearTimeout(safety);
  }, []);

  const handleCreatePetAction = async () => {
    try {
      const res = await createPet(null, newName, newShape);
      if (res.data?.pet) {
          setPets(prev => [...prev, res.data.pet]);
          setCurrentPet(res.data.pet);
          setCreationStep(false);
          setView('game');
      }
    } catch (err) { alert('Error creating pet'); }
  };

  return (
    <div className="app-container" style={{ background: '#050508', minHeight: '100vh', color: 'white', width: '100vw', position: 'relative' }}>
      <AnimatePresence>
        {loading && <SplashScreen key="splash" />}
      </AnimatePresence>

      <main style={{ width: '100%', height: '100vh', opacity: loading ? 0 : 1, transition: 'opacity 0.5s' }}>
          {view === 'lobby' && !creationStep && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <header style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>{user?.firstName?.toUpperCase() || 'PLAYER'}</h1>
                <div className="hud-capsule" style={{ background: 'rgba(255,255,255,0.05)' }}><UserIcon size={18} /></div>
              </header>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflowX: 'auto', padding: '0 40px', gap: '30px', scrollSnapType: 'x mandatory' }} className="hide-scroll">
                {pets.map(pet => (
                  <div 
                    key={pet._id} 
                    style={{ scrollSnapAlign: 'center', minWidth: '300px', height: '480px', borderRadius: '50px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}
                    onClick={() => { setCurrentPet(pet); setView('game'); }}
                  >
                    <div style={{ height: '70%' }}>
                      <Suspense fallback={<div className="loader-center"><Loader2 className="animate-spin" size={40} /></div>}>
                        <ModelViewer type="pet" color={pet.skinColor} accessories={pet.accessories} isLobby={true} style={{ height: '100%' }} />
                      </Suspense>
                    </div>
                    <div style={{ padding: '24px', textAlign: 'center' }}>
                      <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }}>{pet.name}</h2>
                      <div className="hud-capsule" style={{ fontSize: '11px', opacity: 0.6, width: 'fit-content', margin: '12px auto' }}>LEVEL {pet.level}</div>
                    </div>
                  </div>
                ))}
                
                <div style={{ scrollSnapAlign: 'center', minWidth: '300px', height: '480px', borderRadius: '50px', border: '2px dashed rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCreationStep(true)}>
                  <Plus size={40} style={{ opacity: 0.2 }} />
                  <span style={{ marginTop: '20px', fontWeight: 800, opacity: 0.2 }}>NEW ENTRY</span>
                </div>
              </div>
            </div>
          )}

          {creationStep && (
            <div style={{ padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: '44px', fontWeight: 900, marginBottom: '40px' }}>NEW<br/>ENTITY</h2>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="NAME" style={{ width: '100%', padding: '24px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '20px', fontWeight: 800, outline: 'none' }} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                {['capsule', 'round', 'boxy'].map(s => (
                  <button key={s} onClick={() => setNewShape(s)} style={{ flex: 1, padding: '16px', borderRadius: '15px', background: newShape === s ? 'white' : 'rgba(255,255,255,0.05)', color: newShape === s ? 'black' : 'white', fontWeight: 800 }}>{s.toUpperCase()}</button>
                ))}
              </div>
              <button onClick={handleCreatePetAction} style={{ marginTop: '40px', width: '100%', padding: '24px', borderRadius: '25px', background: 'white', color: 'black', fontWeight: 900, fontSize: '18px' }}>INITIALIZE</button>
              <button onClick={() => setCreationStep(false)} style={{ marginTop: '20px', opacity: 0.4 }}>CANCEL</button>
            </div>
          )}

          {view === 'game' && currentPet && (
            <div style={{ height: '100vh', position: 'relative' }}>
               <button onClick={() => setView('lobby')} style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 1000, background: 'rgba(0,0,0,0.3)', width: '45px', height: '45px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
               </button>
               <Suspense fallback={<div className="loader-center"><Loader2 className="animate-spin" size={40} color="white" /></div>}>
                  <Pet pet={currentPet} onUpdate={setCurrentPet} />
                  <Actions pet={currentPet} onUpdate={setCurrentPet} />
               </Suspense>
            </div>
          )}
      </main>
    </div>
  );
}

export default App;