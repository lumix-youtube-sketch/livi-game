import React, { useEffect, useState, Suspense, useRef } from 'react';
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
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    if (days > 0) return `${days}d`;
    return `${hours}h`;
};

// --- COMPONENTS ---

const SplashScreen = () => (
  <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="nebula-bg" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
      <div style={{ width: '200px', height: '200px', position: 'relative' }}>
        <Suspense fallback={<Loader2 className="animate-spin" size={40} color="white" />}>
           <ModelViewer type="pet" color="#6c5ce7" shape="capsule" isLobby={true} style={{ height: '100%' }} />
        </Suspense>
      </div>
      <motion.h1 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.5 }}
        style={{ marginTop: 20, fontFamily: 'Nunito', fontWeight: 900, fontSize: 48, letterSpacing: -2, background: 'linear-gradient(to bottom, #fff, #636e72)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
      >
        LIVI
      </motion.h1>
      <div style={{ width: 140, height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1, marginTop: 30, overflow: 'hidden' }}>
          <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, transparent, #fff, transparent)' }} />
      </div>
  </motion.div>
);

const LobbyCard = ({ pet, onClick }) => (
    <motion.div 
        layoutId={`pet-${pet._id}`}
        onClick={onClick}
        whileTap={{ scale: 0.97 }}
        className="glass-panel-ultra"
        style={{ 
            minWidth: '280px', 
            height: '460px', 
            borderRadius: '40px', 
            position: 'relative', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column',
            margin: '0 15px',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)'
        }}
    >
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 120%, ${pet.skinColor}22 0%, transparent 70%)`, zIndex: 0 }} />
        
        <div style={{ flex: 1, zIndex: 1, marginTop: '-10px' }}>
            <Suspense fallback={null}>
                <ModelViewer type="pet" color={pet.skinColor} shape={pet.shape} accessories={pet.accessories} background="transparent" isLobby={true} style={{ height: '100%' }} />
            </Suspense>
        </div>
        
        <div style={{ padding: '32px 24px', zIndex: 2, background: 'linear-gradient(to top, rgba(10,10,15,0.9), transparent)' }}>
            <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 900, fontFamily: 'Nunito', letterSpacing: '-1px' }}>{pet.name}</h2>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <div className="hud-capsule" style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', opacity: 0.8 }}>LEVEL {pet.level}</div>
                <div className="hud-capsule" style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', opacity: 0.8 }}>{getPetAge(pet.createdAt)}</div>
            </div>
        </div>
    </motion.div>
);

function App() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [currentPet, setCurrentPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('loading'); 
  const [activeAction, setActiveAction] = useState(null);

  const [creationStep, setCreationStep] = useState(false);
  const [newName, setNewName] = useState('Livi');
  const [newShape, setNewShape] = useState('capsule');
  const [partnerId, setPartnerId] = useState('');

  useEffect(() => {
    WebApp.ready(); WebApp.expand();
    WebApp.setHeaderColor('#0a0a0f'); WebApp.setBackgroundColor('#0a0a0f');

    const initAuth = async () => {
      try {
        const res = await login();
        setUser(res.data.user);
        const startParam = WebApp.initDataUnsafe?.start_param;
        if (startParam && startParam.startsWith('join_')) {
            const petId = startParam.replace('join_', '');
            const joinRes = await joinPet(petId);
            setCurrentPet(joinRes.data.pet); setView('game'); setLoading(false); return;
        }
        setPets(res.data.pets || []);
        setTimeout(() => {
            setView('lobby');
            setLoading(false);
        }, 2000);
      } catch (err) { 
          console.error('Auth Error:', err);
          setView('lobby'); 
          setLoading(false); 
      }
    };
    initAuth();
  }, []);

  const handleCreatePet = async () => {
    try {
      const res = await createPet(partnerId || null, newName, newShape);
      setPets([...pets, res.data.pet]); setCurrentPet(res.data.pet);
      setCreationStep(false); setView('game');
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  return (
    <div className="app-container" style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <AnimatePresence mode="wait">
          {loading && <SplashScreen key="splash" />}
      </AnimatePresence>
      
      {!loading && (
        <AnimatePresence mode="wait">
            {view === 'lobby' && !creationStep && (
                <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="nebula-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
                    <header style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ opacity: 0.4, fontSize: '11px', fontWeight: 800, letterSpacing: '2px' }}>TERMINAL_READY</div>
                            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, fontFamily: 'Nunito' }}>{user?.firstName?.toUpperCase() || 'PLAYER'}</h1>
                        </div>
                        <div className="hud-capsule" style={{ borderRadius: '14px', width: '40px', height: '40px', padding: 0, justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}>
                           <UserIcon size={20} color="rgba(255,255,255,0.5)" />
                        </div>
                    </header>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflowX: 'auto', padding: '0 30px', gap: '10px', scrollSnapType: 'x mandatory', paddingBottom: '40px' }} className="hide-scroll">
                        {pets.map(pet => (
                            <div key={pet._id} style={{ scrollSnapAlign: 'center' }}>
                                <LobbyCard pet={pet} onClick={() => { setCurrentPet(pet); setView('game'); }} />
                            </div>
                        ))}
                        
                        <div style={{ scrollSnapAlign: 'center' }}>
                            <motion.div 
                                onClick={() => setCreationStep(true)}
                                whileTap={{ scale: 0.95 }}
                                className="glass-panel"
                                style={{ 
                                    minWidth: '280px', 
                                    height: '460px', 
                                    borderRadius: '40px', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    margin: '0 15px',
                                    cursor: 'pointer',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    background: 'rgba(255,255,255,0.01)'
                                }}
                            >
                                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Plus size={32} color="rgba(255,255,255,0.3)" />
                                </div>
                                <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '1px', opacity: 0.4 }}>NEW_ENTRY</span>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}

            {creationStep && (
                <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="nebula-bg" style={{ minHeight: '100vh', padding: '40px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <button onClick={() => setCreationStep(false)} style={{ position: 'absolute', top: 30, left: 30, background: 'rgba(255,255,255,0.05)', color: 'white', padding: '10px 20px', borderRadius: '12px', fontWeight: 800, fontSize: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>BACK</button>
                    
                    <h2 style={{ fontSize: '38px', fontWeight: 900, marginBottom: '8px', lineHeight: 1, fontFamily: 'Nunito' }}>NEW<br/>ENTITY</h2>
                    <p style={{ opacity: 0.4, marginBottom: '48px', fontSize: '14px', fontWeight: 700 }}>IDENTITY_CONFIGURATION</p>
                    
                    <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', marginBottom: '16px', background: 'rgba(255,255,255,0.02)' }}>
                        <label style={{ display: 'block', marginBottom: '12px', opacity: 0.3, fontWeight: 800, fontSize: '10px', letterSpacing: '2px' }}>DESIGNATION</label>
                        <input value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', fontSize: '18px', fontWeight: 800, outline: 'none', fontFamily: 'Nunito' }} />
                    </div>
                    
                    <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', marginBottom: '48px', background: 'rgba(255,255,255,0.02)' }}>
                        <label style={{ display: 'block', marginBottom: '16px', opacity: 0.3, fontWeight: 800, fontSize: '10px', letterSpacing: '2px' }}>MORPHOLOGY</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {['capsule', 'round', 'boxy'].map(s => (
                                <button key={s} onClick={() => setNewShape(s)} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: newShape === s ? 'white' : 'rgba(255,255,255,0.03)', border: 'none', color: newShape === s ? 'black' : 'white', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px', transition: 'all 0.3s' }}>{s}</button>
                            ))}
                        </div>
                    </div>
                    
                    <button onClick={handleCreatePet} style={{ width: '100%', padding: '22px', borderRadius: '20px', background: 'white', color: 'black', fontWeight: 900, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', letterSpacing: '1px' }}>
                        INITIALIZE <ArrowRight size={20} />
                    </button>
                </motion.div>
            )}

            {view === 'game' && currentPet && (
                <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
                   <button onClick={() => setView('lobby')} style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 1000, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', color: 'white', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                       <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
                   </button>
                   
                   <Suspense fallback={<div className="loader-center"><Loader2 className="animate-spin" size={40} color="white" /></div>}>
                      <Pet pet={currentPet} activeAction={activeAction} onUpdate={setCurrentPet} />
                   </Suspense>
                   <Suspense fallback={null}>
                      <Actions pet={currentPet} onUpdate={setCurrentPet} onActionTrigger={setActiveAction} />
                   </Suspense>
                </motion.div>
            )}
        </AnimatePresence>
      )}
    </div>
  );
}

export default App;