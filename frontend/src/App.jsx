import React, { useEffect, useState, Suspense } from 'react';
import WebApp from '@twa-dev/sdk';
import { login, createPet } from './api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, User as UserIcon, Loader2, ArrowRight } from 'lucide-react';
import ModelViewer from './components/ModelViewer';
import './App.css';

const Pet = React.lazy(() => import('./components/Pet'));
const Actions = React.lazy(() => import('./components/Actions'));

const BG_CLASSES = ['bg-cyber-neon', 'bg-zen-garden', 'bg-abyssal-depths', 'bg-celestial-void', 'bg-sunset-mirage'];

const playSound = (freq = 400, type = 'sine', duration = 0.1) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch(e) {}
};

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
    login().then(res => {
        if (res?.data) { setUser(res.data.user); setPets(res.data.pets || []); }
        setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="app-container" style={{ background: '#0a0a0a', minHeight: '100vh', color: 'white', overflow: 'hidden' }}>
      {loading ? (
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" color="#6c5ce7" /></div>
      ) : (
        <main style={{ width: '100%', height: '100vh', position: 'relative' }}>
          {view === 'lobby' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <header style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-1px' }}>My Livi</h2>
                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}><UserIcon size={20} color="#a29bfe" /></div>
              </header>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflowX: 'auto', padding: '0 40px', gap: '20px', scrollSnapType: 'x mandatory' }} className="hide-scroll">
                {pets.map((pet, idx) => (
                  <motion.div 
                    key={pet._id} 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { 
                        playSound(500 + (idx * 50));
                        setCurrentPet(pet); 
                        setView('game'); 
                    }}
                    className={BG_CLASSES[idx % BG_CLASSES.length]}
                    style={{ scrollSnapAlign: 'center', minWidth: '280px', height: '420px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}
                  >
                    <div style={{ height: '80%', pointerEvents: 'none' }}>
                        <ModelViewer type="pet" color={pet.skinColor} accessories={pet.accessories} isLobby={true} />
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '25px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                        <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>{pet.name}</h3>
                        <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '5px' }}>Level {pet.level} • Co-op</div>
                    </div>
                  </motion.div>
                ))}
                
                <div style={{ scrollSnapAlign: 'center', minWidth: '280px', height: '420px', borderRadius: '40px', border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} onClick={() => alert('Coming soon')}>
                    <Plus size={40} color="#6c5ce7" />
                    <span style={{ marginTop: '15px', fontWeight: 800, fontSize: '14px', letterSpacing: '1px' }}>CREATE NEW</span>
                </div>
              </div>
            </div>
          )}

          {view === 'game' && currentPet && (
            <div style={{ height: '100vh', position: 'relative' }}>
               <button onClick={() => setView('lobby')} style={{ position: 'absolute', top: '25px', left: '25px', zIndex: 100, background: 'rgba(255,255,255,0.1)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', backdropFilter: 'blur(10px)' }}><ArrowRight size={20} color="white" style={{ transform: 'rotate(180deg)' }} /></button>
               <Suspense fallback={null}>
                 <Pet 
                   pet={currentPet} 
                   onUpdate={setCurrentPet} 
                   activeAction={activeAction} 
                   bgClass={BG_CLASSES[pets.indexOf(currentPet) % BG_CLASSES.length]}
                 />
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