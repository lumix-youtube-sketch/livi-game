import React, { useEffect, useState, Suspense, useRef } from 'react';
import WebApp from '@twa-dev/sdk';
import { login, createPet, joinPet } from './api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight, Sparkles, Zap } from 'lucide-react';
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
  <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="nebula-bg" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 120, height: 120, background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px rgba(108, 92, 231, 0.6)' }}>
          <span style={{ fontSize: 60 }}>👾</span>
      </motion.div>
      <h1 style={{ marginTop: 40, fontFamily: 'Nunito', fontWeight: 900, fontSize: 42, letterSpacing: -1, background: 'linear-gradient(to right, #fff, #a29bfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Livi</h1>
      <div style={{ width: 180, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 24, overflow: 'hidden' }}>
          <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} style={{ width: '50%', height: '100%', background: 'white', borderRadius: 2 }} />
      </div>
  </motion.div>
);

const LobbyCard = ({ pet, onClick }) => (
    <motion.div 
        layoutId={`pet-${pet._id}`}
        onClick={onClick}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
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
            border: '1px solid rgba(255,255,255,0.1)'
        }}
    >
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 100%, ${pet.skinColor}33 0%, transparent 60%)`, zIndex: 0 }} />
        
        <div style={{ flex: 1, zIndex: 1, marginTop: '-20px' }}>
            <Suspense fallback={null}>
                <ModelViewer type="pet" color={pet.skinColor} shape={pet.shape} accessories={pet.accessories} background="transparent" isLobby={true} style={{ height: '110%' }} />
            </Suspense>
        </div>
        
        <div style={{ padding: '24px', zIndex: 2, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
            <h2 style={{ margin: 0, fontSize: '36px', fontWeight: 900, fontFamily: 'Nunito' }}>{pet.name}</h2>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <div className="hud-capsule" style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', border: 'none' }}>LVL {pet.level}</div>
                <div className="hud-capsule" style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', border: 'none' }}>{getPetAge(pet.createdAt)} old</div>
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
    WebApp.setHeaderColor('#0f0f14'); WebApp.setBackgroundColor('#0f0f14');

    const initAuth = async () => {
      try {
        const res = await login();
        setUser(res.data.user);
        const startParam = WebApp.initDataUnsafe?.start_param;
        if (startParam && startParam.startsWith('join_')) {
            const petId = startParam.replace('join_', '');
            const joinRes = await joinPet(petId);
            setCurrentPet(joinRes.data.pet); setView('game'); return;
        }
        setPets(res.data.pets || []);
        // Simulate a bit of loading for the splash screen feel
        setTimeout(() => {
            setLoading(false);
            setView('lobby');
        }, 1500);
      } catch (err) { console.error(err); setView('lobby'); setLoading(false); }
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
    <div className="app-container">
      <AnimatePresence>
          {loading && <SplashScreen key="splash" />}
      </AnimatePresence>
      
      {!loading && (
        <>
            {view === 'lobby' && !creationStep && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="nebula-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
                    <header style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ opacity: 0.6, fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>WELCOME BACK</div>
                            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 900 }}>{user?.firstName || 'Friend'}</h1>
                        </div>
                        <div className="hud-capsule" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, justifyContent: 'center' }}>
                           <span style={{ fontSize: '18px' }}>👤</span>
                        </div>
                    </header>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflowX: 'auto', padding: '0 30px', gap: '10px', scrollSnapType: 'x mandatory', paddingBottom: '20px' }} className="hide-scroll">
                        {pets.map(pet => (
                            <div key={pet._id} style={{ scrollSnapAlign: 'center' }}>
                                <LobbyCard pet={pet} onClick={() => { setCurrentPet(pet); setView('game'); }} />
                            </div>
                        ))}
                        
                        {/* New Pet Card */}
                        <div style={{ scrollSnapAlign: 'center' }}>
                            <motion.div 
                                onClick={() => setCreationStep(true)}
                                whileHover={{ scale: 1.02 }}
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
                                    border: '2px dashed rgba(255,255,255,0.1)'
                                }}
                            >
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                    <Plus size={40} color="var(--primary)" />
                                </div>
                                <span style={{ fontWeight: 800, fontSize: '18px' }}>Create New</span>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}

            {creationStep && (
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="nebula-bg" style={{ minHeight: '100vh', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <button onClick={() => setCreationStep(false)} style={{ position: 'absolute', top: 30, left: 30, background: 'rgba(255,255,255,0.1)', color: 'white', padding: '12px 24px', borderRadius: '20px', fontWeight: 800 }}>← Cancel</button>
                    
                    <h2 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '10px', lineHeight: 1 }}>Design<br/>Companion</h2>
                    <p style={{ opacity: 0.6, marginBottom: '40px', fontSize: '16px' }}>Customize your new digital friend.</p>
                    
                    <div className="glass-panel" style={{ padding: '24px', borderRadius: '32px', marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '12px', opacity: 0.5, fontWeight: 800, fontSize: '12px', letterSpacing: '1px' }}>NAME</label>
                        <input value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '20px', fontWeight: 800, outline: 'none' }} placeholder="e.g. Sparky" />
                    </div>
                    
                    <div className="glass-panel" style={{ padding: '24px', borderRadius: '32px', marginBottom: '40px' }}>
                        <label style={{ display: 'block', marginBottom: '16px', opacity: 0.5, fontWeight: 800, fontSize: '12px', letterSpacing: '1px' }}>SHAPE</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {['capsule', 'round', 'boxy'].map(s => (
                                <button key={s} onClick={() => setNewShape(s)} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: newShape === s ? 'var(--primary)' : 'rgba(255,255,255,0.05)', border: newShape === s ? '2px solid rgba(255,255,255,0.5)' : 'none', color: 'white', fontWeight: 800, textTransform: 'capitalize', transition: 'all 0.2s' }}>{s}</button>
                            ))}
                        </div>
                    </div>
                    
                    <button onClick={handleCreatePet} style={{ width: '100%', padding: '24px', borderRadius: '28px', background: 'white', color: 'black', fontWeight: 900, fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 40px rgba(255,255,255,0.2)' }}>
                        Bring to Life <ArrowRight size={24} />
                    </button>
                </motion.div>
            )}

            {view === 'game' && currentPet && (
                <div style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
                   {/* Back Button Overlay */}
                   <button onClick={() => setView('lobby')} style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                       <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
                   </button>
                   
                   <Suspense fallback={<div className="loader-center"><div className="loader-ring"></div></div>}>
                      <Pet pet={currentPet} activeAction={activeAction} onUpdate={setCurrentPet} />
                   </Suspense>
                   <Suspense fallback={null}>
                      <Actions pet={currentPet} onUpdate={setCurrentPet} onActionTrigger={setActiveAction} />
                   </Suspense>
                </div>
            )}
        </>
      )}
    </div>
  );
}

export default App;